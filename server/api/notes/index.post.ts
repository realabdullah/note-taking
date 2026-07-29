import { createNoteSchema } from "~~/shared/schemas/note"
import { noteService } from "../../services/notes"

export default defineEventHandler(async (event) => {
  const currentUser = await requireUser(event)
  const body = await readValidatedBody(event, createNoteSchema.parse)
  const note = await noteService.create(currentUser.id, body)

  setResponseStatus(event, 201)
  return { note }
})
