import type { CreateNoteInput, UpdateNoteInput } from "~~/shared/types/note"
import { uniqueTags } from "~~/shared/utils/note"
import { noteRepository } from "../repositories/notes"
import { sanitizeRichText } from "../utils/rich-text"

export const noteService = {
  list: noteRepository.list.bind(noteRepository),
  search: noteRepository.search.bind(noteRepository),
  get: noteRepository.get.bind(noteRepository),
  listTags: noteRepository.listTags.bind(noteRepository),

  create(userId: string, input: CreateNoteInput) {
    return noteRepository.create(userId, {
      id: input.id,
      title: input.title?.trim() ?? "",
      content: sanitizeRichText(input.content ?? ""),
      tagNames: uniqueTags(input.tagNames ?? []),
      clientUpdatedAt: input.clientUpdatedAt,
    })
  },

  update(userId: string, noteId: string, input: UpdateNoteInput) {
    return noteRepository.update(userId, noteId, {
      ...input,
      content: input.content === undefined ? undefined : sanitizeRichText(input.content),
      title: input.title?.trim(),
      tagNames: input.tagNames ? uniqueTags(input.tagNames) : undefined,
    })
  },

  archive(userId: string, noteId: string) {
    return noteRepository.setArchived(userId, noteId, true)
  },

  restore(userId: string, noteId: string) {
    return noteRepository.setArchived(userId, noteId, false)
  },

  delete(userId: string, noteId: string) {
    return noteRepository.softDelete(userId, noteId)
  },
}
