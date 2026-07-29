export const normalizeTag = (value: string) => value.trim().replace(/\s+/g, " ").toLocaleLowerCase()

export const uniqueTags = (values: string[]) => {
  const seen = new Set<string>()

  return values
    .map((value) => value.trim().replace(/\s+/g, " "))
    .filter((value) => {
      const normalized = normalizeTag(value)
      if (!normalized || seen.has(normalized)) return false
      seen.add(normalized)
      return true
    })
}

export const deriveNoteTitle = (title: string, content: string) => {
  const explicitTitle = title.trim()
  if (explicitTitle) return explicitTitle

  const firstMeaningfulLine = content
    .split("\n")
    .map((line) => line.replace(/^#{1,6}\s*/, "").trim())
    .find(Boolean)

  if (!firstMeaningfulLine) return "Untitled note"
  return firstMeaningfulLine.length > 72 ? `${firstMeaningfulLine.slice(0, 69)}…` : firstMeaningfulLine
}

export const notePreview = (content: string, length = 150) => {
  const plain = content.replace(/[#>*_`~-]/g, "").replace(/\s+/g, " ").trim()
  return plain.length > length ? `${plain.slice(0, length - 1)}…` : plain
}
