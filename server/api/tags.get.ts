import { noteService } from "../services/notes"

export default defineEventHandler(async (event) => {
  const currentUser = await requireUser(event)
  return { tags: await noteService.listTags(currentUser.id) }
})
