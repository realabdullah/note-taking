export default defineEventHandler((event) => {
  const isPublicShare =
    event.path.startsWith("/share/") || event.path.startsWith("/api/public/notes/")

  setResponseHeaders(event, {
    "Referrer-Policy": isPublicShare ? "no-referrer" : "strict-origin-when-cross-origin",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  })
})
