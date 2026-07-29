import { noteIdSchema } from "~~/shared/schemas/note"
import { noteService } from "../../services/notes"

export default defineEventHandler(async (event) => {
  const currentUser = await requireUser(event)
  const noteId = noteIdSchema.parse(getRouterParam(event, "id"))
  const note = await noteService.get(currentUser.id, noteId)

  if (!note) throw createError({ statusCode: 404, statusMessage: "Note not found" })
  return { note }
})
