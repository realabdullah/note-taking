import { noteIdSchema } from "~~/shared/schemas/note";
import { noteShareService } from "../../../services/note-shares";

export default defineEventHandler(async event => {
	const currentUser = await requireUser(event);
	const noteId = noteIdSchema.parse(getRouterParam(event, "id"));
	const share = await noteShareService.create(currentUser.id, noteId, getRequestURL(event).origin);

	setResponseHeader(event, "Cache-Control", "private, no-store");
	return { share };
});
