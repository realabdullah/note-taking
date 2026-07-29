import { describe, expect, it } from "vitest"
import { createNoteSchema, updateNoteSchema } from "../../shared/schemas/note"

describe("note API schemas", () => {
  it("applies safe defaults to a new note", () => {
    expect(createNoteSchema.parse({})).toEqual({ title: "", content: "", tagNames: [] })
  })

  it("rejects an update without a changed field", () => {
    expect(() => updateNoteSchema.parse({ expectedVersion: 1 })).toThrow()
  })

  it("rejects invalid versions and oversized titles", () => {
    expect(() => updateNoteSchema.parse({ title: "x".repeat(241), expectedVersion: 0 })).toThrow()
  })
})
