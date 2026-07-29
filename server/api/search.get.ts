import { searchQuerySchema } from "~~/shared/schemas/note"
import { noteService } from "../services/notes"

export default defineEventHandler(async (event) => {
  const currentUser = await requireUser(event)
  const query = await getValidatedQuery(event, searchQuerySchema.parse)

  return { notes: await noteService.search(currentUser.id, query.q, query.limit) }
})
