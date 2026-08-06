import sanitizeHtml from "sanitize-html"

const allowedTags = [
  "p",
  "br",
  "strong",
  "em",
  "s",
  "code",
  "pre",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "blockquote",
  "hr",
]

export const sanitizeRichText = (content: string) =>
  sanitizeHtml(content, { allowedTags, allowedAttributes: {} })
