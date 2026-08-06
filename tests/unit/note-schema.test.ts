import { describe, expect, it } from "vitest"
import { createNoteSchema, noteShareTokenSchema, updateNoteSchema } from "../../shared/schemas/note"

describe("note API schemas", () => {
  it("applies safe defaults to a new note", () => {
    expect(createNoteSchema.parse({})).toEqual({ title: "", content: "", tagNames: [] })
  })

  it("rejects an update without a changed field", () => {
    expect(() => updateNoteSchema.parse({})).toThrow()
  })

  it("rejects oversized titles", () => {
    expect(() => updateNoteSchema.parse({ title: "x".repeat(241) })).toThrow()
  })

  it("only accepts 256-bit base64url share tokens", () => {
    expect(noteShareTokenSchema.parse("a".repeat(43))).toBe("a".repeat(43))
    expect(() => noteShareTokenSchema.parse("a".repeat(42))).toThrow()
    expect(() => noteShareTokenSchema.parse(`${"a".repeat(42)}+`)).toThrow()
  })
})
