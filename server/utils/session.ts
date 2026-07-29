import type { H3Event } from "h3"
import { auth } from "./auth"

export const requireUser = async (event: H3Event) => {
  const session = await auth.api.getSession({ headers: event.headers })

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required",
    })
  }

  return session.user
}
