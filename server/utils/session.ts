import type { H3Event } from "h3"
import { auth } from "./auth"

export const getCurrentUser = async (event: H3Event) => {
  const session = await auth.api.getSession({ headers: event.headers })
  return session?.user ?? null
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
