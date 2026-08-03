import { tokenIdSchema } from "~~/shared/schemas/token";
import { personalAccessTokenService } from "../../services/personal-access-tokens";

export default defineEventHandler(async event => {
	const currentUser = await requireSessionUser(event);
	const tokenId = tokenIdSchema.parse(getRouterParam(event, "id"));

	await personalAccessTokenService.revoke(currentUser.id, tokenId);
	setResponseStatus(event, 204);
});
