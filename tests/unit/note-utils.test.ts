import { describe, expect, it } from "vitest"
import { deriveNoteTitle, normalizeTag, notePreview, uniqueTags } from "../../shared/utils/note"

describe("note utilities", () => {
  it("derives a title from the first meaningful markdown line", () => {
    expect(deriveNoteTitle("", "\n## Architecture review\nFollow-up")).toBe("Architecture review")
  })

  it("prefers an explicit title", () => {
    expect(deriveNoteTitle("  Demo feedback ", "ignored")).toBe("Demo feedback")
  })

  it("normalizes and de-duplicates tags without losing display casing", () => {
    expect(uniqueTags([" Engineering ", "engineering", "Product   Demo"])).toEqual([
      "Engineering",
      "Product Demo",
    ])
    expect(normalizeTag(" Product   Demo ")).toBe("product demo")
  })

  it("creates a compact plain-text preview", () => {
    expect(notePreview("## Result\n**Works** as expected", 20)).toBe("Result Works as exp…")
  })
})
