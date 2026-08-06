import { noteIdSchema, updateNoteSchema } from "~~/shared/schemas/note"
import { noteService } from "../../services/notes"

export default defineEventHandler(async (event) => {
  const currentUser = await requireWriteUser(event)
  const noteId = noteIdSchema.parse(getRouterParam(event, "id"))
  const body = await readValidatedBody(event, updateNoteSchema.parse)
  const note = await noteService.update(currentUser.id, noteId, body)
  return { note }
})
