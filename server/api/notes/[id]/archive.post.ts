import { noteIdSchema, versionMutationSchema } from "~~/shared/schemas/note"
import { noteService } from "../../../services/notes"

export default defineEventHandler(async (event) => {
  const currentUser = await requireWriteUser(event)
  const noteId = noteIdSchema.parse(getRouterParam(event, "id"))
  await readValidatedBody(event, versionMutationSchema.parse)
  const note = await noteService.archive(currentUser.id, noteId)

  return { note }
})
