import Dexie, { type EntityTable } from "dexie"
import type { Note, SyncMutation } from "~~/shared/types/note"

export type SyncMetadata = {
  userId: string
  lastPulledAt: string | null
  lastSyncedAt: string | null
}

class FieldnoteDatabase extends Dexie {
  cachedNotes!: EntityTable<Note, "id">
  pendingMutations!: EntityTable<SyncMutation, "id">
  syncMetadata!: EntityTable<SyncMetadata, "userId">

  constructor() {
    super("fieldnote")
    this.version(1).stores({
      cachedNotes: "&id,userId,updatedAt,archivedAt,deletedAt,[userId+updatedAt]",
      pendingMutations: "&id,userId,entityId,createdAt,nextAttemptAt,[userId+createdAt]",
      syncMetadata: "&userId",
    })
  }
}

let database: FieldnoteDatabase | null = null

export const getLocalDatabase = () => {
  if (!database) database = new FieldnoteDatabase()
  return database
}

export const clearLocalUserData = async (userId: string) => {
  const db = getLocalDatabase()
  await db.transaction(
    "rw",
    [db.cachedNotes, db.pendingMutations, db.syncMetadata],
    async () => {
      await db.cachedNotes.where("userId").equals(userId).delete()
      await db.pendingMutations.where("userId").equals(userId).delete()
      await db.syncMetadata.delete(userId)
    },
  )
}
