import { noteShareTokenSchema } from "~~/shared/schemas/note";
import { noteShareService } from "../../../services/note-shares";

export default defineEventHandler(async event => {
	const token = noteShareTokenSchema.parse(getRouterParam(event, "token"));
	const note = await noteShareService.getPublic(token);

	if (!note) throw createError({ statusCode: 404, statusMessage: "Shared note not found" });

	setResponseHeaders(event, {
		"Cache-Control": "private, no-store",
		"Referrer-Policy": "no-referrer",
		"X-Robots-Tag": "noindex, nofollow, noarchive",
	});
	return { note };
});
