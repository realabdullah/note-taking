import type { NoteShare } from "~~/shared/types/note-share";
import { noteShareRepository } from "../repositories/note-shares";

const serializeShare = (share: { token: string; createdAt: Date }, origin: string): NoteShare => ({
	url: `${origin}/share/${share.token}`,
	createdAt: share.createdAt.toISOString(),
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

	revoke: noteShareRepository.revoke.bind(noteShareRepository),
	getPublic: noteShareRepository.getPublic.bind(noteShareRepository),
};
