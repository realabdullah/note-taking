import { createTokenSchema } from "~~/shared/schemas/token";
import { personalAccessTokenService } from "../../services/personal-access-tokens";

export default defineEventHandler(async event => {
	const currentUser = await requireSessionUser(event);
	const body = await readValidatedBody(event, createTokenSchema.parse);
	const result = await personalAccessTokenService.create(currentUser.id, body);

	setResponseStatus(event, 201);
	return result;
});
