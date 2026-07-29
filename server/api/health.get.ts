export default defineEventHandler(() => ({
  status: "ok",
  service: "fieldnote",
  timestamp: new Date().toISOString(),
}))
