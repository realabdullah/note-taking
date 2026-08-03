import { createError, getHeader } from "h3"
import type { H3Event } from "h3"
import { personalAccessTokenService } from "../services/personal-access-tokens"
import { auth } from "./auth"

const extractBearerToken = (event: H3Event) => {
	const authorization = getHeader(event, "authorization")
	if (!authorization?.toLowerCase().startsWith("bearer ")) return null

	const token = authorization.slice("bearer ".length).trim()
	return token || null
}

export const getCurrentUser = async (event: H3Event) => {
	const bearerToken = extractBearerToken(event)

	if (bearerToken) {
		const user = await personalAccessTokenService.authenticate(bearerToken)
		if (user) event.context.authMethod = "bearer"
		return user
	}

	const session = await auth.api.getSession({ headers: event.headers })
	const user = session?.user ?? null
	if (user) event.context.authMethod = "session"
	return user
}

export const requireUser = async (event: H3Event) => {
	const currentUser = await getCurrentUser(event)

	if (!currentUser) {
		throw createError({
			statusCode: 401,
			statusMessage: "Authentication required",
		})
	}

	return currentUser
}

export const requireWriteUser = async (event: H3Event) => {
	const currentUser = await requireUser(event)

	if (event.context.authMethod === "bearer") {
		throw createError({ statusCode: 403, statusMessage: "Personal access tokens are read-only" })
	}

	return currentUser
}

export const requireSessionUser = async (event: H3Event) => {
	const currentUser = await requireUser(event)

	if (event.context.authMethod === "bearer") {
		throw createError({ statusCode: 403, statusMessage: "Sign in with your account to continue" })
	}

	return currentUser
}
