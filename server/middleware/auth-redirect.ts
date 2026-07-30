import { isProtectedPagePath } from "~~/shared/utils/auth"
import { getCurrentUser } from "../utils/session"

export default defineEventHandler(async (event) => {
  if (event.method !== "GET" && event.method !== "HEAD") return

  const accept = getHeader(event, "accept") ?? ""
  if (!accept.includes("text/html")) return

  const requestUrl = getRequestURL(event)
  if (!isProtectedPagePath(requestUrl.pathname)) return

  const currentUser = await getCurrentUser(event)
  if (currentUser) return

  const requestedPath = `${requestUrl.pathname}${requestUrl.search}`
  return sendRedirect(event, `/login?redirect=${encodeURIComponent(requestedPath)}`, 302)
})
