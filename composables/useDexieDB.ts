import bcrypt from "bcryptjs";

export const useDexieDB = (): NotesAPI => {
	const { user, userPrefs, fontFamily, colorTheme } = storeToRefs(useStore());

	const generateToken = async (userId: string) => {
		const existingToken = await db.sessions.where("userId").equals(userId).first();
		const token = existingToken?.token ?? crypto.randomUUID();
		const expiry = existingToken?.expiry ?? Date.now() + 1000 * 60 * 60 * 24; // 24-hour expiry

		if (!existingToken) await db.sessions.add({ token, userId, expiry });

		return { token, expiry };
	};

	const signUp = async (
		email: string,
		password: string,
		securityQuestions?: Array<{ question: string; answer: string }>
	) => {
		const notification = push.promise("Signing up...");

		try {
			const existingUser = await db.users.where("email").equals(email).first();
			if (existingUser) throw new Error("Email already in use");

			const userId = crypto.randomUUID();
			const hashedPassword = await bcrypt.hash(password, 10);
			await db.users.add({ id: userId, email, password: hashedPassword });
			if (securityQuestions && securityQuestions.length >= 1)
				await setupSecurityQuestions(userId, securityQuestions);

			const { token, expiry } = await generateToken(userId);
			const cookie = useCookie("notes--st", { expires: new Date(expiry) });
			cookie.value = token;

			user.value = { id: userId, email };
			await navigateTo({ name: "notes" });
			notification.resolve("Signed up successfully");
		} catch (error) {
			notification.reject({ title: "Error", message: error as string });
		}
	};

	const logout = async () => {
		const notification = push.promise("Logging out...");

		try {
			const token = useCookie("notes--st");
			await db.sessions
				.where("token")
				.equals(token.value || "")
				.delete();
			token.value = "";
			user.value = null;
			await navigateTo({ name: "login" });
			notification.resolve("Logged out successfully");
		} catch (error) {
			notification.reject({ title: "Error", message: error as string });
		}
	};

	const signIn = async (email: string, password: string) => {
		const notification = push.promise("Signing in...");

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
			notification.resolve("Signed in successfully");
		} catch (error) {
			notification.reject({ title: "Error", message: error as string });
		}
	};

	const getAllNotes = async (archived = false): Promise<NoteObj[]> => {
		return db.notes
			.where("userId")
			.equals(user.value?.id ?? "")
			.and(note => note.isArchived === archived)
			.toArray();
	};

	const getNoteByID = async (id: string): Promise<NoteObj | null> => {
		try {
			const note = await db.notes.where({ id, userId: user.value?.id }).first();
			return note ?? null;
		} catch (error) {
			push.error({ title: "Error", message: error as string });
			return null;
		}
	};

	const createNote = async (noteInput: NoteObj) => {
		const notification = push.promise("Creating note...");

		try {
			const id = crypto.randomUUID().replaceAll("-", "");
			noteInput.id = id;
			await db.notes.add(serialize({ ...noteInput, userId: user.value?.id }));
			notification.resolve("Note created successfully");
			return { ...noteInput, id };
		} catch (error) {
			notification.reject({ title: "Error", message: error as string });
		}
	};

	const updateNote = async (id: string, updates: NoteObj): Promise<void> => {
		const notification = push.promise("Updating note...");

		try {
			await db.notes.update(id, { ...serialize({ ...updates, userId: user.value?.id }) });
			notification.resolve("Note updated successfully");
		} catch (error) {
			notification.reject({ title: "Error", message: error as string });
		}
	};

	const deleteNote = async (id: string): Promise<void> => {
		const notification = push.promise("Deleting note...");

		try {
			await db.notes.where({ id, userId: user.value?.id }).delete();
			notification.resolve("Note deleted successfully");
		} catch (error) {
			notification.reject({ title: "Error", message: error as string });
		}
	};

	const getAccountPrefs = async () => {
		try {
			const prefs = await db.settings.where({ user: user.value?.id }).first();
			if (!prefs) {
				const newPrefs = { userId: user.value?.id, colorMode: colorTheme.value, fontFamily: fontFamily.value };
				await db.settings.add({
					user: user.value?.id,
					colorMode: colorTheme.value,
					fontFamily: fontFamily.value,
				});
				return newPrefs as unknown as SettingsObj;
			}
			return prefs as unknown as SettingsObj;
		} catch (error) {
			push.error({ title: "Error", message: error as string });
		}
	};

	const setAccountPrefs = async (settings: Record<string, string>) => {
		const notification = push.promise("Updating account preferences...");

		try {
			// @ts-expect-error well
			await db.settings.update(user.value?.id, { ...serialize({ ...settings, user: user.value?.id }) });
			userPrefs.value = { ...userPrefs.value, ...settings } as SettingsObj;
			notification.resolve("Account preferences updated successfully");
			return userPrefs.value;
		} catch (error) {
			notification.reject({ title: "Error", message: error as string });
		}
	};

	const updatePassword = async (newPassword: string, oldPassword: string) => {
		const notification = push.promise("Updating password...");

		try {
			const dbUser = await db.users
				.where("id")
				.equals(user.value?.id as string)
				.first();
			const isValid = await bcrypt.compare(oldPassword, dbUser?.password ?? "");
			if (!isValid) throw new Error("Invalid old password");

			const hashedPassword = await bcrypt.hash(newPassword, 10);
			await db.users.update(user.value?.id as string, { password: hashedPassword });
			notification.resolve("Password updated successfully");
		} catch (error) {
			notification.reject({ title: "Error", message: error as string });
		}
	};

	const setupSecurityQuestions = async (userId: string, questions: SecurityQuestion["questions"]): Promise<void> => {
		try {
			await db.table("securityQuestions").put({
				userId,
				questions: questions.map(q => ({
					question: q.question,
					answer: q.answer.toLowerCase().trim(),
				})),
			});
		} catch (error) {
			throw Error(error as string);
		}
	};

	const getSecurityQuestions = async (email: string) => {
		try {
			const user = await db.users.where("email").equals(email).first();
			if (!user) throw new Error("User not found");

			const securityQuestions = (await db
				.table("securityQuestions")
				.where("userId")
				.equals(user.id)
				.first()) as SecurityQuestion;
			if (!securityQuestions) throw new Error("No security questions found");

			return securityQuestions.questions.map(q => q.question);
		} catch (error) {
			push.error({ title: "Error", message: error as string });
		}
	};

	const verifySecurityAnswers = async (email: string, answers: string[]) => {
		try {
			const user = await db.users.where("email").equals(email).first();
			if (!user) throw new Error("User not found");

			const securityQuestions = (await db
				.table("securityQuestions")
				.where("userId")
				.equals(user.id)
				.first()) as SecurityQuestion;
			if (!securityQuestions) throw new Error("No security questions found");

			return answers.every(
				(answer, index) => securityQuestions.questions[index].answer === answer.toLowerCase().trim()
			);
		} catch (error) {
			push.error({ title: "Error", message: error as string });
		}
	};

	const resetPassword = async (email: string, newPassword: string, answers: string[]): Promise<void> => {
		try {
			await db.transaction("rw", [db.users, db.sessions, db.table("securityQuestions")], async () => {
				const areAnswersCorrect = await verifySecurityAnswers(email, answers);
				if (!areAnswersCorrect) throw new Error("Incorrect security answers");

				const user = await db.users.where("email").equals(email).first();
				if (!user) throw new Error("User not found");

				const hashedPassword = await bcrypt.hash(newPassword, 10);
				await db.users.where("id").equals(user.id).modify({ password: hashedPassword });

				await db.sessions.where("userId").equals(user.id).delete();
			});
		} catch (error) {
			push.error({ title: "Error", message: error as string });
		}
	};

	return {
		signUp,
		signIn,
		logout,
		getAllNotes,
		getNoteByID,
		createNote,
		updateNote,
		deleteNote,
		getAccountPrefs,
		setAccountPrefs,
		updatePassword,
	};
};
