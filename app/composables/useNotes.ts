import type { CreateNoteInput, Note, NotesPage, SyncMutation, UpdateNoteInput } from "~~/shared/types/note"
import { getLocalDatabase } from "~/lib/local-db.client"

const RETRY_DELAYS = [2_000, 5_000, 15_000, 60_000, 5 * 60_000]
let activeSyncPromise: Promise<boolean> | null = null

const sortNotes = (notes: Note[]) =>
  [...notes].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))

export const useNotes = () => {
  const notes = useState<Note[]>("notes", () => [])
  const activeUserId = useState<string | null>("notes-user-id", () => null)
  const isReady = useState("notes-ready", () => false)
  const isSyncing = useState("notes-syncing", () => false)
  const lastSyncedAt = useState<string | null>("notes-last-synced", () => null)
  const syncError = useState<string | null>("notes-sync-error", () => null)

  const replaceNote = (note: Note) => {
    notes.value = sortNotes([note, ...notes.value.filter((candidate) => candidate.id !== note.id)])
  }

  const loadFromCache = async (userId: string) => {
    const db = getLocalDatabase()
    const [cachedNotes, metadata] = await Promise.all([
      db.cachedNotes.where("userId").equals(userId).toArray(),
      db.syncMetadata.get(userId),
    ])

    notes.value = sortNotes(cachedNotes)
    lastSyncedAt.value = metadata?.lastSyncedAt ?? null
  }

  const queueMutation = async (mutation: SyncMutation) => {
    const db = getLocalDatabase()

    if (mutation.operation === "update") {
      await db.pendingMutations
        .where("entityId")
        .equals(mutation.entityId)
        .and((item) => item.operation === "update")
        .delete()
    }

    await db.pendingMutations.put(mutation)
  }

  const pullRemoteNotes = async (userId: string) => {
    const db = getLocalDatabase()
    const pendingIds = new Set(
      (await db.pendingMutations.where("userId").equals(userId).toArray()).map((item) => item.entityId),
    )
    const remoteNotes: Note[] = []

    for (const archived of [false, true]) {
      let cursor: string | undefined

      do {
        const page = await $fetch<NotesPage>("/api/notes", {
          query: { limit: 100, cursor, archived },
        })
        remoteNotes.push(...page.notes)
        cursor = page.nextCursor ?? undefined
      } while (cursor)
    }

    for (const note of remoteNotes) {
      if (!pendingIds.has(note.id)) {
        await db.cachedNotes.put({ ...note, syncState: "synced" })
      }
    }

    const cached = await db.cachedNotes.where("userId").equals(userId).toArray()
    notes.value = sortNotes(cached)

    const now = new Date().toISOString()
    lastSyncedAt.value = now
    await db.syncMetadata.put({ userId, lastPulledAt: now, lastSyncedAt: now })
  }

  const applyMutation = async (mutation: SyncMutation) => {
    const db = getLocalDatabase()
    let remoteNote: Note | null = null

    if (mutation.operation === "create") {
      const response = await $fetch<{ note: Note }>("/api/notes", {
        method: "POST",
        body: mutation.payload,
      })
      remoteNote = response.note
    }

    if (mutation.operation === "update") {
      const response = await $fetch<{ note: Note }>(`/api/notes/${mutation.entityId}`, {
        method: "PATCH",
        body: mutation.payload,
      })
      remoteNote = response.note
    }

    if (mutation.operation === "archive" || mutation.operation === "restore") {
      const response = await $fetch<{ note: Note }>(
        `/api/notes/${mutation.entityId}/${mutation.operation}`,
        {
          method: "POST",
          body: mutation.payload,
        },
      )
      remoteNote = response.note
    }

    if (mutation.operation === "delete") {
      await $fetch(`/api/notes/${mutation.entityId}`, {
        method: "DELETE",
        body: mutation.payload,
      })
      await db.cachedNotes.delete(mutation.entityId)
      notes.value = notes.value.filter((note) => note.id !== mutation.entityId)
    }

    await db.pendingMutations.delete(mutation.id)

    if (remoteNote) {
      const laterMutations = await db.pendingMutations.where("entityId").equals(mutation.entityId).toArray()

      if (laterMutations.length) {
        const localNote = await db.cachedNotes.get(mutation.entityId)
        if (localNote) {
          const pendingNote: Note = {
            ...localNote,
            createdAt: remoteNote.createdAt,
            version: remoteNote.version,
            syncState: navigator.onLine ? "pending" : "local",
          }
          await db.cachedNotes.put(pendingNote)
          replaceNote(pendingNote)
        }
      } else {
        const syncedNote = { ...remoteNote, syncState: "synced" as const }
        await db.cachedNotes.put(syncedNote)
        replaceNote(syncedNote)
      }
    }

    const syncedAt = new Date().toISOString()
    lastSyncedAt.value = syncedAt
    await db.syncMetadata.update(mutation.userId, { lastSyncedAt: syncedAt })
  }

  const performSync = async ({ pull = false }: { pull?: boolean } = {}) => {
    if (!import.meta.client || !activeUserId.value || !navigator.onLine) {
      return false
    }

    const db = getLocalDatabase()
    isSyncing.value = true
    syncError.value = null

    let completed = true

    try {
      let hasProcessedMutations = true

      while (hasProcessedMutations) {
        hasProcessedMutations = false
        const pending = await db.pendingMutations.where("userId").equals(activeUserId.value).sortBy("createdAt")

        for (const mutation of pending) {
          if (mutation.nextAttemptAt && Date.parse(mutation.nextAttemptAt) > Date.now()) continue

          try {
            await applyMutation(mutation)
            hasProcessedMutations = true
          } catch {
            const attempts = mutation.attempts + 1
            const retryDelay = RETRY_DELAYS[Math.min(attempts - 1, RETRY_DELAYS.length - 1)] ?? 5 * 60_000
            await db.pendingMutations.put({
              ...mutation,
              attempts,
              nextAttemptAt: new Date(Date.now() + retryDelay).toISOString(),
            })
            syncError.value = "Some changes are saved on this device and waiting to sync."
            completed = false
            hasProcessedMutations = false
            break
          }
        }
      }

      if (pull) await pullRemoteNotes(activeUserId.value)
    } catch {
      syncError.value = "Could not reach the notebook server."
      completed = false
    } finally {
      isSyncing.value = false

      if (activeUserId.value && navigator.onLine) {
        const remaining = await getLocalDatabase().pendingMutations
          .where("userId")
          .equals(activeUserId.value)
          .count()
        if (remaining) window.setTimeout(() => void sync(), 250)
      }
    }

    return completed
  }

  const sync = ({ pull = false }: { pull?: boolean } = {}) => {
    if (activeSyncPromise) return activeSyncPromise

    const syncPromise = performSync({ pull })
    activeSyncPromise = syncPromise
    void syncPromise.then(
      () => {
        if (activeSyncPromise === syncPromise) activeSyncPromise = null
      },
      () => {
        if (activeSyncPromise === syncPromise) activeSyncPromise = null
      },
    )
    return syncPromise
  }

  const initialize = async (userId: string) => {
    if (!import.meta.client) return
    activeUserId.value = userId
    await loadFromCache(userId)
    isReady.value = true
    await sync({ pull: true })
  }

  const createNote = async (input: CreateNoteInput = {}) => {
    if (!activeUserId.value) throw new Error("A user session is required")

    const now = new Date().toISOString()
    const note: Note = {
      id: crypto.randomUUID(),
      userId: activeUserId.value,
      title: input.title ?? "",
      content: input.content ?? "",
      tags: input.tagNames ?? [],
      createdAt: now,
      updatedAt: now,
      archivedAt: null,
      deletedAt: null,
      version: 1,
      syncState: navigator.onLine ? "pending" : "local",
    }
    const db = getLocalDatabase()
    await db.cachedNotes.put(note)
    replaceNote(note)
    await queueMutation({
      id: crypto.randomUUID(),
      userId: activeUserId.value,
      entityType: "note",
      entityId: note.id,
      operation: "create",
      payload: {
        id: note.id,
        title: note.title,
        content: note.content,
        tagNames: note.tags,
      },
      createdAt: now,
      attempts: 0,
      nextAttemptAt: null,
    })
    void sync()
    return note
  }

  const updateNote = async (
    noteId: string,
    update: Pick<UpdateNoteInput, "title" | "content" | "tagNames">,
  ) => {
    if (!activeUserId.value) return
    const db = getLocalDatabase()
    const current = await db.cachedNotes.get(noteId)
    if (!current) return

    const now = new Date().toISOString()
    const updated: Note = {
      ...current,
      title: update.title ?? current.title,
      content: update.content ?? current.content,
      tags: update.tagNames ?? current.tags,
      updatedAt: now,
      syncState: navigator.onLine ? "pending" : "local",
    }

    await db.cachedNotes.put(updated)
    replaceNote(updated)
    await queueMutation({
      id: crypto.randomUUID(),
      userId: activeUserId.value,
      entityType: "note",
      entityId: noteId,
      operation: "update",
      payload: {
        ...update,
      },
      createdAt: now,
      attempts: 0,
      nextAttemptAt: null,
    })
    void sync()
  }

  const changeArchiveState = async (noteId: string, archived: boolean) => {
    if (!activeUserId.value) throw new Error("A user session is required")
    const db = getLocalDatabase()
    const current = await db.cachedNotes.get(noteId)
    if (!current) throw new Error("The note could not be found on this device")

    const now = new Date().toISOString()
    const updated: Note = {
      ...current,
      archivedAt: archived ? now : null,
      updatedAt: now,
      syncState: navigator.onLine ? "pending" : "local",
    }
    await db.cachedNotes.put(updated)
    replaceNote(updated)
    await queueMutation({
      id: crypto.randomUUID(),
      userId: activeUserId.value,
      entityType: "note",
      entityId: noteId,
      operation: archived ? "archive" : "restore",
      payload: {},
      createdAt: now,
      attempts: 0,
      nextAttemptAt: null,
    })
    return { note: updated, syncPromise: sync() }
  }

  const deleteNote = async (noteId: string) => {
    if (!activeUserId.value) return
    const db = getLocalDatabase()
    const current = await db.cachedNotes.get(noteId)
    if (!current) return

    notes.value = notes.value.filter((note) => note.id !== noteId)
    await queueMutation({
      id: crypto.randomUUID(),
      userId: activeUserId.value,
      entityType: "note",
      entityId: noteId,
      operation: "delete",
      payload: {},
      createdAt: new Date().toISOString(),
      attempts: 0,
      nextAttemptAt: null,
    })
    void sync()
  }

  const activeNotes = computed(() => notes.value.filter((note) => !note.archivedAt && !note.deletedAt))
  const archivedNotes = computed(() => notes.value.filter((note) => note.archivedAt && !note.deletedAt))

  return {
    notes,
    activeNotes,
    archivedNotes,
    isReady,
    isSyncing,
    lastSyncedAt,
    syncError,
    initialize,
    sync,
    createNote,
    updateNote,
    changeArchiveState,
    deleteNote,
  }
}
