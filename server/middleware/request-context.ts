export default defineEventHandler((event) => {
  const startedAt = performance.now()
  const requestId = getHeader(event, "x-request-id") ?? crypto.randomUUID()
  event.context.requestId = requestId
  setHeader(event, "x-request-id", requestId)

  event.node.res.on("finish", () => {
    const path = event.path.split("?")[0]
    console.info(
      JSON.stringify({
        type: "http_request",
        requestId,
        method: event.method,
        path,
        status: event.node.res.statusCode,
        durationMs: Math.round(performance.now() - startedAt),
      }),
    )
  })
})
