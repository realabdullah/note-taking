import { notesQuerySchema } from "~~/shared/schemas/note"
import { noteService } from "../../services/notes"

export default defineEventHandler(async (event) => {
  const currentUser = await requireUser(event)
  const query = await getValidatedQuery(event, notesQuerySchema.parse)

  return noteService.list(currentUser.id, {
    archived: query.archived ?? false,
    cursor: query.cursor,
    limit: query.limit,
    tag: query.tag,
  })
})
