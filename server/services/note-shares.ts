import type { NoteShare } from "~~/shared/types/note-share";
import { noteShareRepository } from "../repositories/note-shares";

const serializeShare = (
	share: { token: string; createdAt: Date; noteUpdatedAt: Date; sourceUpdatedAt: Date },
	origin: string
): NoteShare => ({
	url: `${origin}/share/${share.token}`,
	createdAt: share.createdAt.toISOString(),
	noteUpdatedAt: share.noteUpdatedAt.toISOString(),
	isStale: share.noteUpdatedAt.getTime() < share.sourceUpdatedAt.getTime(),
});

export const noteShareService = {
	async getForOwner(userId: string, noteId: string, origin: string): Promise<NoteShare | null> {
		const share = await noteShareRepository.getForOwner(userId, noteId);
		return share ? serializeShare(share, origin) : null;
	},

	async create(userId: string, noteId: string, origin: string): Promise<NoteShare> {
		const share = await noteShareRepository.create(userId, noteId);
		return serializeShare(share, origin);
	},

	async update(userId: string, noteId: string, origin: string): Promise<NoteShare> {
		const share = await noteShareRepository.update(userId, noteId);
		return serializeShare(share, origin);
	},

	revoke: noteShareRepository.revoke.bind(noteShareRepository),
	getPublic: noteShareRepository.getPublic.bind(noteShareRepository),
};
