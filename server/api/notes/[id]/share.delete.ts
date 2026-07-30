import { noteIdSchema } from "~~/shared/schemas/note";
import { noteShareService } from "../../../services/note-shares";

export default defineEventHandler(async event => {
	const currentUser = await requireUser(event);
	const noteId = noteIdSchema.parse(getRouterParam(event, "id"));
	await noteShareService.revoke(currentUser.id, noteId);

	setResponseHeader(event, "Cache-Control", "private, no-store");
	setResponseStatus(event, 204);
	return null;
});
