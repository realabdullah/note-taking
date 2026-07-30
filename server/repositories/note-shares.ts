import { randomBytes } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import type { PublicNote } from "~~/shared/types/note-share";
import { db } from "../database/client";
import { noteShares, notes } from "../database/schema";
import { noteRepository } from "./notes";

type NoteShareRecord = {
	token: string;
	createdAt: Date;
};

const createToken = () => randomBytes(32).toString("base64url");

const findForOwner = async (userId: string, noteId: string): Promise<NoteShareRecord | null> => {
	const [share] = await db
		.select({ token: noteShares.token, createdAt: noteShares.createdAt })
		.from(noteShares)
		.innerJoin(notes, eq(noteShares.noteId, notes.id))
		.where(and(eq(noteShares.noteId, noteId), eq(notes.userId, userId), isNull(notes.deletedAt)))
		.limit(1);

	return share ?? null;
};

export const noteShareRepository = {
	getForOwner: findForOwner,

	async create(userId: string, noteId: string): Promise<NoteShareRecord> {
		const note = await noteRepository.get(userId, noteId);
		if (!note) throw createError({ statusCode: 404, statusMessage: "Note not found" });

		const existing = await findForOwner(userId, noteId);
		if (existing) return existing;

		for (let attempt = 0; attempt < 3; attempt += 1) {
			const [created] = await db
				.insert(noteShares)
				.values({
					noteId,
					token: createToken(),
					title: note.title,
					content: note.content,
					tags: note.tags,
					noteCreatedAt: new Date(note.createdAt),
					noteUpdatedAt: new Date(note.updatedAt),
				})
				.onConflictDoNothing()
				.returning({ token: noteShares.token, createdAt: noteShares.createdAt });

			if (created) return created;

			const concurrentShare = await findForOwner(userId, noteId);
			if (concurrentShare) return concurrentShare;
		}

		throw new Error("Unable to create note share");
	},

	async revoke(userId: string, noteId: string): Promise<boolean> {
		const note = await noteRepository.get(userId, noteId);
		if (!note) return false;

		const [revoked] = await db
			.delete(noteShares)
			.where(eq(noteShares.noteId, noteId))
			.returning({ noteId: noteShares.noteId });

		return Boolean(revoked);
	},

	async getPublic(token: string): Promise<PublicNote | null> {
		const [row] = await db
			.select({
				title: noteShares.title,
				content: noteShares.content,
				tags: noteShares.tags,
				noteCreatedAt: noteShares.noteCreatedAt,
				noteUpdatedAt: noteShares.noteUpdatedAt,
			})
			.from(noteShares)
			.innerJoin(notes, eq(noteShares.noteId, notes.id))
			.where(and(eq(noteShares.token, token), isNull(notes.deletedAt)))
			.limit(1);

		if (!row) return null;

		return {
			title: row.title,
			content: row.content,
			tags: row.tags,
			createdAt: row.noteCreatedAt.toISOString(),
			updatedAt: row.noteUpdatedAt.toISOString(),
		};
	},
};
