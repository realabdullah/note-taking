import { noteIdSchema, versionMutationSchema } from "~~/shared/schemas/note"
import { noteService } from "../../../services/notes"

export default defineEventHandler(async (event) => {
  const currentUser = await requireUser(event)
  const noteId = noteIdSchema.parse(getRouterParam(event, "id"))
  const body = await readValidatedBody(event, versionMutationSchema.parse)
  const note = await noteService.restore(currentUser.id, noteId, body.expectedVersion)

  return { note }
})
