import { noteIdSchema } from "~~/shared/schemas/note";
import { noteShareService } from "../../../services/note-shares";

export default defineEventHandler(async event => {
	const currentUser = await requireWriteUser(event);
	const noteId = noteIdSchema.parse(getRouterParam(event, "id"));
	const share = await noteShareService.update(currentUser.id, noteId, getRequestURL(event).origin);

	setResponseHeader(event, "Cache-Control", "private, no-store");
	return { share };
});
