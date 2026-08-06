import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import NoteEditor from "../../app/components/NoteEditor.vue";
import type { Note } from "../../shared/types/note";

const note: Note = {
	id: "note-1",
	userId: "user-1",
	title: "Original title",
	content: "<p>Original content</p>",
	tags: ["work"],
	createdAt: "2026-08-06T10:00:00.000Z",
	updatedAt: "2026-08-06T10:00:00.000Z",
	archivedAt: null,
	deletedAt: null,
	version: 1,
	syncState: "local",
};

describe("NoteEditor", () => {
	it("flushes pending changes before requesting an archive", async () => {
		const wrapper = mount(NoteEditor, { props: { note } });

		await wrapper.get("input.writing-title").setValue("Ready to archive");
		await wrapper.get('button[aria-label="Archive note"]').trigger("click");

		expect(wrapper.emitted("save")).toEqual([
			[{ title: "Ready to archive", content: note.content, tagNames: ["work"] }],
		]);
		expect(wrapper.emitted("archive")).toHaveLength(1);

		wrapper.unmount();
	});

	it("keeps the archive action clickable unless its mutation is already running", async () => {
		const wrapper = mount(NoteEditor, { props: { note } });
		const archiveButton = wrapper.get('button[aria-label="Archive note"]');

		expect(archiveButton.attributes("disabled")).toBeUndefined();
		await archiveButton.trigger("click");
		expect(wrapper.emitted("archive")).toHaveLength(1);

		await wrapper.setProps({ archivePending: true });
		expect(archiveButton.attributes("aria-busy")).toBe("true");
		expect(archiveButton.attributes("disabled")).toBeDefined();

		wrapper.unmount();
	});
});
