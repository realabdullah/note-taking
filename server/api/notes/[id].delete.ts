import { noteIdSchema, versionMutationSchema } from "~~/shared/schemas/note"
import { noteService } from "../../services/notes"

export default defineEventHandler(async (event) => {
  const currentUser = await requireUser(event)
  const noteId = noteIdSchema.parse(getRouterParam(event, "id"))
  const body = await readValidatedBody(event, versionMutationSchema.parse)

  await noteService.delete(currentUser.id, noteId, body.expectedVersion)
  setResponseStatus(event, 204)
})
