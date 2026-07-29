import {
  and,
  desc,
  eq,
  ilike,
  inArray,
  isNotNull,
  isNull,
  lt,
  or,
  sql,
} from "drizzle-orm"
import type { Note, NoteRevision, NotesPage, UpdateNoteInput } from "~~/shared/types/note"
import { normalizeTag, uniqueTags } from "~~/shared/utils/note"
import { db } from "../database/client"
import { noteRevisions, notes, noteTags, tags } from "../database/schema"

type NoteRow = typeof notes.$inferSelect

const serializeNote = (row: NoteRow, tagNames: string[] = []): Note => ({
  id: row.id,
  userId: row.userId,
  title: row.title,
  content: row.content,
  tags: tagNames,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
  archivedAt: row.archivedAt?.toISOString() ?? null,
  deletedAt: row.deletedAt?.toISOString() ?? null,
  version: row.version,
})

const loadTagMap = async (userId: string, noteIds: string[]) => {
  const result = new Map<string, string[]>()
  if (!noteIds.length) return result

  const rows = await db
    .select({ noteId: noteTags.noteId, name: tags.name })
    .from(noteTags)
    .innerJoin(tags, eq(noteTags.tagId, tags.id))
    .where(and(eq(tags.userId, userId), inArray(noteTags.noteId, noteIds)))
    .orderBy(tags.name)

  for (const row of rows) {
    result.set(row.noteId, [...(result.get(row.noteId) ?? []), row.name])
  }

  return result
}

const replaceTags = async (userId: string, noteId: string, requestedTags: string[]) => {
  await db.delete(noteTags).where(eq(noteTags.noteId, noteId))

  for (const name of uniqueTags(requestedTags)) {
    const [tag] = await db
      .insert(tags)
      .values({
        userId,
        name,
        normalizedName: normalizeTag(name),
      })
      .onConflictDoUpdate({
        target: [tags.userId, tags.normalizedName],
        set: { name },
      })
      .returning({ id: tags.id })

    if (tag) {
      await db.insert(noteTags).values({ noteId, tagId: tag.id }).onConflictDoNothing()
    }
  }
}

const loadNoteRow = async (userId: string, noteId: string, includeDeleted = false) => {
  const conditions = [eq(notes.id, noteId), eq(notes.userId, userId)]
  if (!includeDeleted) conditions.push(isNull(notes.deletedAt))

  const [row] = await db
    .select()
    .from(notes)
    .where(and(...conditions))
    .limit(1)

  return row ?? null
}

export const noteRepository = {
  async list(
    userId: string,
    options: { archived: boolean; cursor?: string; limit: number; tag?: string },
  ): Promise<NotesPage> {
    const conditions = [
      eq(notes.userId, userId),
      isNull(notes.deletedAt),
      options.archived ? isNotNull(notes.archivedAt) : isNull(notes.archivedAt),
    ]

    if (options.cursor) conditions.push(lt(notes.updatedAt, new Date(options.cursor)))

    if (options.tag) {
      const matchingTags = await db
        .select({ id: tags.id })
        .from(tags)
        .where(and(eq(tags.userId, userId), eq(tags.normalizedName, normalizeTag(options.tag))))

      if (!matchingTags.length) return { notes: [], nextCursor: null }

      const taggedNotes = await db
        .select({ noteId: noteTags.noteId })
        .from(noteTags)
        .where(inArray(noteTags.tagId, matchingTags.map((tag) => tag.id)))

      if (!taggedNotes.length) return { notes: [], nextCursor: null }
      conditions.push(inArray(notes.id, taggedNotes.map((row) => row.noteId)))
    }

    const rows = await db
      .select()
      .from(notes)
      .where(and(...conditions))
      .orderBy(desc(notes.updatedAt), desc(notes.id))
      .limit(options.limit + 1)

    const hasMore = rows.length > options.limit
    const pageRows = hasMore ? rows.slice(0, options.limit) : rows
    const tagMap = await loadTagMap(
      userId,
      pageRows.map((row) => row.id),
    )

    return {
      notes: pageRows.map((row) => serializeNote(row, tagMap.get(row.id))),
      nextCursor: hasMore ? pageRows.at(-1)?.updatedAt.toISOString() ?? null : null,
    }
  },

  async search(userId: string, query: string, limit: number): Promise<Note[]> {
    const tagRows = await db
      .select({ id: tags.id })
      .from(tags)
      .where(and(eq(tags.userId, userId), ilike(tags.name, `%${query}%`)))

    const taggedNoteRows = tagRows.length
      ? await db
          .select({ noteId: noteTags.noteId })
          .from(noteTags)
          .where(inArray(noteTags.tagId, tagRows.map((tag) => tag.id)))
      : []

    const textCondition = or(
      ilike(notes.title, `%${query}%`),
      ilike(notes.content, `%${query}%`),
      ...(taggedNoteRows.length
        ? [inArray(notes.id, taggedNoteRows.map((row) => row.noteId))]
        : []),
    )

    const rows = await db
      .select()
      .from(notes)
      .where(and(eq(notes.userId, userId), isNull(notes.deletedAt), textCondition))
      .orderBy(desc(notes.updatedAt))
      .limit(limit)

    const tagMap = await loadTagMap(
      userId,
      rows.map((row) => row.id),
    )
    return rows.map((row) => serializeNote(row, tagMap.get(row.id)))
  },

  async get(userId: string, noteId: string): Promise<Note | null> {
    const row = await loadNoteRow(userId, noteId)
    if (!row) return null
    const tagMap = await loadTagMap(userId, [row.id])
    return serializeNote(row, tagMap.get(row.id))
  },

  async create(
    userId: string,
    input: { id?: string; title: string; content: string; tagNames: string[]; clientUpdatedAt?: string },
  ): Promise<Note> {
    const now = input.clientUpdatedAt ? new Date(input.clientUpdatedAt) : new Date()
    const [row] = await db
      .insert(notes)
      .values({
        id: input.id ?? crypto.randomUUID(),
        userId,
        title: input.title,
        content: input.content,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing()
      .returning()

    if (!row) {
      const existing = await this.get(userId, input.id!)
      if (existing) return existing
      throw new Error("Unable to create note")
    }

    await replaceTags(userId, row.id, input.tagNames)
    return serializeNote(row, uniqueTags(input.tagNames))
  },

  async update(
    userId: string,
    noteId: string,
    input: UpdateNoteInput,
  ): Promise<{ note: Note; conflict?: NoteRevision }> {
    const current = await loadNoteRow(userId, noteId)
    if (!current) throw createError({ statusCode: 404, statusMessage: "Note not found" })

    if (current.version !== input.expectedVersion) {
      const [revision] = await db
        .insert(noteRevisions)
        .values({
          noteId,
          userId,
          title: input.title ?? current.title,
          content: input.content ?? current.content,
          source: "conflict-local",
        })
        .returning()

      if (!revision) throw new Error("Unable to preserve conflicting note revision")

      const tagMap = await loadTagMap(userId, [noteId])
      return {
        note: serializeNote(current, tagMap.get(noteId)),
        conflict: {
          id: revision.id,
          noteId,
          title: revision.title,
          content: revision.content,
          createdAt: revision.createdAt.toISOString(),
          source: "conflict-local",
        },
      }
    }

    const [updated] = await db
      .update(notes)
      .set({
        title: input.title ?? current.title,
        content: input.content ?? current.content,
        updatedAt: input.clientUpdatedAt ? new Date(input.clientUpdatedAt) : new Date(),
        version: sql`${notes.version} + 1`,
      })
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId), eq(notes.version, input.expectedVersion)))
      .returning()

    if (!updated) return this.update(userId, noteId, input)
    if (input.tagNames) await replaceTags(userId, noteId, input.tagNames)

    const tagMap = await loadTagMap(userId, [noteId])
    return { note: serializeNote(updated, tagMap.get(noteId)) }
  },

  async setArchived(
    userId: string,
    noteId: string,
    archived: boolean,
    expectedVersion: number,
  ): Promise<Note> {
    const [updated] = await db
      .update(notes)
      .set({
        archivedAt: archived ? new Date() : null,
        updatedAt: new Date(),
        version: sql`${notes.version} + 1`,
      })
      .where(
        and(
          eq(notes.id, noteId),
          eq(notes.userId, userId),
          isNull(notes.deletedAt),
          eq(notes.version, expectedVersion),
        ),
      )
      .returning()

    if (!updated) {
      const current = await this.get(userId, noteId)
      if (!current) throw createError({ statusCode: 404, statusMessage: "Note not found" })
      throw createError({ statusCode: 409, statusMessage: "Note changed on another device", data: { note: current } })
    }

    const tagMap = await loadTagMap(userId, [noteId])
    return serializeNote(updated, tagMap.get(noteId))
  },

  async softDelete(userId: string, noteId: string, expectedVersion: number): Promise<void> {
    const [deleted] = await db
      .update(notes)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
        version: sql`${notes.version} + 1`,
      })
      .where(
        and(
          eq(notes.id, noteId),
          eq(notes.userId, userId),
          isNull(notes.deletedAt),
          eq(notes.version, expectedVersion),
        ),
      )
      .returning({ id: notes.id })

    if (!deleted) {
      const current = await this.get(userId, noteId)
      if (!current) return
      throw createError({ statusCode: 409, statusMessage: "Note changed on another device", data: { note: current } })
    }
  },

  async listTags(userId: string): Promise<Array<{ id: string; name: string; count: number }>> {
    return db
      .select({
        id: tags.id,
        name: tags.name,
        count: sql<number>`count(${noteTags.noteId})::int`,
      })
      .from(tags)
      .leftJoin(noteTags, eq(tags.id, noteTags.tagId))
      .where(eq(tags.userId, userId))
      .groupBy(tags.id, tags.name)
      .orderBy(tags.name)
  },
}
