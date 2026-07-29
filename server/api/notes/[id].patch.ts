import { noteIdSchema, updateNoteSchema } from "~~/shared/schemas/note"
import { noteService } from "../../services/notes"

export default defineEventHandler(async (event) => {
  const currentUser = await requireUser(event)
  const noteId = noteIdSchema.parse(getRouterParam(event, "id"))
  const body = await readValidatedBody(event, updateNoteSchema.parse)
  const result = await noteService.update(currentUser.id, noteId, body)

  if (result.conflict) {
    throw createError({
      statusCode: 409,
      statusMessage: "Note changed on another device",
      data: { note: result.note, revision: result.conflict },
    })
  }

  return { note: result.note }
})
