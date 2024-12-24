import bcrypt from "bcryptjs";

export const useDexieDB = (): NotesAPI => {
	const { user } = storeToRefs(useStore());

	const generateToken = async (userId: string) => {
		const existingToken = await db.sessions.where("userId").equals(userId).first();
		const token = existingToken?.token ?? crypto.randomUUID();
		const expiry = existingToken?.expiry ?? Date.now() + 1000 * 60 * 60 * 24; // 24-hour expiry

		if (!existingToken) await db.sessions.add({ token, userId, expiry });

		return { token, expiry };
	};

	const signUp = async (email: string, password: string) => {
		try {
			const existingUser = await db.users.where("email").equals(email).first();
			if (existingUser) throw new Error("Email already in use");

			const userId = crypto.randomUUID();
			const hashedPassword = await bcrypt.hash(password, 10);
			await db.users.add({ id: userId, email, password: hashedPassword });

			const { token, expiry } = await generateToken(userId);
			const cookie = useCookie("notes--st", { expires: new Date(expiry) });
			cookie.value = token;

			user.value = { id: userId, email };
			await navigateTo({ name: "notes" });
		} catch (error) {
			useToast().add({ title: "Error", description: error as string, color: "error" });
		}
	};

	const logout = async () => {
		try {
			const token = useCookie("notes--st");
			await db.sessions
				.where("token")
				.equals(token.value || "")
				.delete();
			token.value = "";
			user.value = null;
			await navigateTo({ name: "login" });
		} catch (error) {
			useToast().add({ title: "Error", description: error as string, color: "error" });
		}
	};

	const signIn = async (email: string, password: string) => {
		try {
			const dbUser = await db.users.where("email").equals(email).first();
			if (!dbUser) throw new Error("Invalid email or password");

			const isValid = await bcrypt.compare(password, dbUser.password);
			if (!isValid) throw new Error("Invalid email or password");

			const { token, expiry } = await generateToken(dbUser.id);
			const cookie = useCookie("notes--st", { expires: new Date(expiry) });
			cookie.value = token;

			user.value = { id: dbUser.id, email: dbUser.email };
			await navigateTo({ name: "notes" });
		} catch (error) {
			useToast().add({ title: "Error", description: error as string, color: "error" });
		}
	};

	const getAllNotes = async (): Promise<NoteObj[]> => {
		return db.notes
			.where("userId")
			.equals(user.value?.id ?? "")
			.toArray();
	};

	const getNoteBySlug = async (slug: string): Promise<NoteObj | null> => {
		const note = await db.notes.where({ slug, userId: user.value?.id }).first();
		return note ?? null;
	};

	const createNote = async (noteInput: NoteObj): Promise<void> => {
		try {
			await db.notes.add(serialize({ ...noteInput, userId: user.value?.id }));
			useToast().add({ title: "Success", description: "Note created successfully", color: "success" });
		} catch (error) {
			useToast().add({ title: "Error", description: error as string, color: "error" });
		}
	};

	const updateNote = async (slug: string, updates: NoteObj): Promise<void> => {
		try {
			await db.notes.update(slug, { ...serialize({ ...updates, userId: user.value?.id }) });
			useToast().add({ title: "Success", description: "Note updated successfully", color: "success" });
		} catch (error) {
			useToast().add({ title: "Error", description: error as string, color: "error" });
		}
	};

	const deleteNote = async (slug: string): Promise<void> => {
		try {
			await db.notes.where({ slug, userId: user.value?.id }).delete();
			useToast().add({ title: "Success", description: "Note deleted successfully", color: "success" });
		} catch (error) {
			useToast().add({ title: "Error", description: error as string, color: "error" });
		}
	};

	return {
		signUp,
		signIn,
		logout,
		getAllNotes,
		getNoteBySlug,
		createNote,
		updateNote,
		deleteNote,
	};
};
