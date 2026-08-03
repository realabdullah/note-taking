import { personalAccessTokenService } from "../../services/personal-access-tokens";

export default defineEventHandler(async event => {
	const currentUser = await requireSessionUser(event);
	return { tokens: await personalAccessTokenService.list(currentUser.id) };
});
