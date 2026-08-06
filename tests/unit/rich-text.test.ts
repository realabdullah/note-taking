import { describe, expect, it } from "vitest"
import { sanitizeRichText } from "../../server/utils/rich-text"

describe("sanitizeRichText", () => {
	it("keeps supported formatting and removes unsafe markup", () => {
		expect(
			sanitizeRichText(
				'<p>Hello <strong>world</strong></p><script>alert("xss")</script><a href="/unsafe">link</a>',
			),
		).toBe('<p>Hello <strong>world</strong></p>link')
	})
})
