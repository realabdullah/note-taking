import type { CreateNoteInput, UpdateNoteInput } from "~~/shared/types/note"
import { uniqueTags } from "~~/shared/utils/note"
import { noteRepository } from "../repositories/notes"

export const noteService = {
  list: noteRepository.list.bind(noteRepository),
  search: noteRepository.search.bind(noteRepository),
  get: noteRepository.get.bind(noteRepository),
  listTags: noteRepository.listTags.bind(noteRepository),

  create(userId: string, input: CreateNoteInput) {
    return noteRepository.create(userId, {
      id: input.id,
      title: input.title?.trim() ?? "",
      content: input.content ?? "",
      tagNames: uniqueTags(input.tagNames ?? []),
      clientUpdatedAt: input.clientUpdatedAt,
    })
  },

  update(userId: string, noteId: string, input: UpdateNoteInput) {
    return noteRepository.update(userId, noteId, {
      ...input,
      title: input.title?.trim(),
      tagNames: input.tagNames ? uniqueTags(input.tagNames) : undefined,
    })
  },

  archive(userId: string, noteId: string, expectedVersion: number) {
    return noteRepository.setArchived(userId, noteId, true, expectedVersion)
  },

  restore(userId: string, noteId: string, expectedVersion: number) {
    return noteRepository.setArchived(userId, noteId, false, expectedVersion)
  },

  delete(userId: string, noteId: string, expectedVersion: number) {
    return noteRepository.softDelete(userId, noteId, expectedVersion)
  },
}
