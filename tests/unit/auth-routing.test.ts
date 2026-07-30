import { describe, expect, it } from "vitest"
import { isProtectedPagePath } from "../../shared/utils/auth"

describe("protected page routing", () => {
  it.each(["/", "/notes", "/notes/abc", "/search", "/archive", "/settings"])(
    "protects %s",
    (path) => {
      expect(isProtectedPagePath(path)).toBe(true)
    },
  )

  it.each(["/login", "/signup", "/share/token", "/api/notes", "/notes-public"])(
    "leaves %s public",
    (path) => {
      expect(isProtectedPagePath(path)).toBe(false)
    },
  )
})
