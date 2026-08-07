import { noteShareTokenSchema } from "~~/shared/schemas/note";
import { noteShareService } from "../../../services/note-shares";

const escapeXml = (value: string) =>
	value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

const wrapTitle = (value: string, maxCharacters = 30) => {
	const words = value.trim().split(/\s+/).filter(Boolean);
	if (!words.length) return ["Shared note"];

	const lines: string[] = [];
	let currentLine = "";
	for (const word of words) {
		const nextLine = currentLine ? `${currentLine} ${word}` : word;
		if (currentLine && nextLine.length > maxCharacters) {
			lines.push(currentLine);
			currentLine = word;
		} else {
			currentLine = nextLine;
		}
	}
	if (currentLine) lines.push(currentLine);

	return lines
		.slice(0, 3)
		.map((line, index) =>
			index === 2 && lines.length > 3 ? `${line.slice(0, maxCharacters - 1).trimEnd()}…` : line
		);
};

export default defineEventHandler(async event => {
	const token = noteShareTokenSchema.parse(getRouterParam(event, "token"));
	const note = await noteShareService.getPublic(token);
	if (!note) {
		throw createError({ statusCode: 404, statusMessage: "Shared note not found" });
	}

	const titleLines = wrapTitle(note.title || "Shared note");
	const titleMarkup = titleLines
		.map(
			(line, index) =>
				`<text x="84" y="${218 + index * 74}" fill="#E8DDCF" font-family="Georgia, serif" font-size="64" letter-spacing="-2">${escapeXml(line)}</text>`
		)
		.join("");

	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" fill="none">
  <rect width="1200" height="630" fill="#2F1838"/>
  <circle cx="1030" cy="110" r="270" fill="#6C3B78" opacity=".42"/>
  <circle cx="1080" cy="570" r="220" fill="#E9673F" opacity=".9"/>
  <path d="M0 520C220 460 310 560 510 500C730 434 830 500 1200 390V630H0V520Z" fill="#3E214B"/>
  <path d="M80 94H1120" stroke="#E8DDCF" stroke-opacity=".24"/>
  <text x="84" y="148" fill="#E8DDCF" fill-opacity=".7" font-family="Arial, sans-serif" font-size="20" letter-spacing="5">FIELDNOTE · SHARED NOTE</text>
  ${titleMarkup}
  <rect x="84" y="458" width="188" height="8" rx="4" fill="#D7ED93"/>
  <text x="84" y="520" fill="#E8DDCF" fill-opacity=".72" font-family="Arial, sans-serif" font-size="24">A quiet place for thoughts.</text>
  <circle cx="1050" cy="530" r="52" fill="#D7ED93"/>
  <path d="M1028 530h44M1050 508v44" stroke="#2F1838" stroke-width="7" stroke-linecap="round"/>
</svg>`;

	setResponseHeader(event, "Content-Type", "image/svg+xml; charset=utf-8");
	setResponseHeader(event, "Cache-Control", "public, max-age=60, s-maxage=60, stale-while-revalidate=300");
	return svg;
});
