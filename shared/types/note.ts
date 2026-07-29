export type SyncState = "local" | "pending" | "syncing" | "synced" | "error" | "conflict"

export type Note = {
  id: string
  userId: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
  archivedAt: string | null
  deletedAt: string | null
  version: number
  syncState?: SyncState
}

export type NoteRevision = {
  id: string
  noteId: string
  title: string
  content: string
  createdAt: string
  source: "conflict-local" | "conflict-server" | "manual"
}

export type CreateNoteInput = {
  id?: string
  title?: string
  content?: string
  tagNames?: string[]
  clientUpdatedAt?: string
}

export type UpdateNoteInput = {
  title?: string
  content?: string
  tagNames?: string[]
  expectedVersion: number
  clientUpdatedAt?: string
}

export type NoteMutationOperation = "create" | "update" | "archive" | "restore" | "delete"

export type SyncMutation = {
  id: string
  userId: string
  entityType: "note"
  entityId: string
  operation: NoteMutationOperation
  payload: CreateNoteInput | UpdateNoteInput | { expectedVersion: number }
  createdAt: string
  attempts: number
  nextAttemptAt: string | null
}

export type NotesPage = {
  notes: Note[]
  nextCursor: string | null
}

export type ConflictPayload = {
  note: Note
  revision: NoteRevision
}
