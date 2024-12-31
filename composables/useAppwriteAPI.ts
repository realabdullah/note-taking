export const useAppwriteAPI = (): NotesAPI => {
	const { user, loadstates, userPrefs, fontFamily } = storeToRefs(useStore());

	const signUp = async (email: string, password: string): Promise<void> => {
		const notification = push.promise("Signing up...");

		try {
			loadstates.value.signingUp = true;
			await awAccount.create(awID.unique(), email, password);
			await signIn(email, password);
			notification.resolve("Sign up successful");
		} catch (error) {
			notification.reject({ title: "Error", message: error as string });
		} finally {
			loadstates.value.signingUp = false;
		}
	};

	const signIn = async (email: string, password: string): Promise<void> => {
		const notification = push.promise("Signing in...");

		try {
			loadstates.value.signingIn = true;
			const authUser = await awAccount.createEmailPasswordSession(email, password);
			if (!authUser) throw new Error("Failed to sign in");
			user.value = { id: authUser.userId, email: authUser.providerUid };
			const prefs = await getAccountPrefs();
			if (prefs) userPrefs.value = { ...userPrefs.value, ...prefs };
			navigateTo("/");
			notification.resolve("Sign in successful");
		} catch (error) {
			notification.reject({ title: "Error", message: error as string });
		} finally {
			loadstates.value.signingIn = false;
		}
	};

	const logout = async (): Promise<void> => {
		const notification = push.promise("Logging out...");

		try {
			loadstates.value.loggingOut = true;
			await awAccount.deleteSession("current");
			user.value = null;
			await navigateTo({ name: "login" });
			notification.resolve("Logged out successfully");
		} catch (error) {
			notification.reject({ title: "Error", message: error as string });
		} finally {
			loadstates.value.loggingOut = false;
		}
	};

	const getAllNotes = async (archived = false): Promise<NoteObj[]> => {
		const response = await awDatabase.listDocuments(awDBconfig.DATABASE_ID, awDBconfig.COLLECTION_ID, [
			awQuery.orderDesc("$createdAt"),
			awQuery.equal("isArchived", archived),
			awQuery.equal("userId", user.value?.id as string),
			awQuery.limit(25),
		]);
		return mapToNoteObj(response.documents) as NoteObj[];
	};

	const getNoteByID = async (id: string): Promise<NoteObj | null> => {
		try {
			loadstates.value.fetchingNote = true;
			const note = await awDatabase.getDocument(awDBconfig.DATABASE_ID, awDBconfig.COLLECTION_ID, id, [
				awQuery.equal("userId", user.value?.id as string),
			]);
			if (!note) return null;
			return mapToNoteObj(note) as NoteObj;
		} catch (error) {
			push.error(error as string);
			return null;
		} finally {
			loadstates.value.fetchingNote = false;
		}
	};

	const createNote = async (noteInput: NoteObj) => {
		const notification = push.promise("Creating a new note...");

		try {
			loadstates.value.creatingNote = true;
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { id, ...rest } = noteInput;
			const result = await awDatabase.createDocument(
				awDBconfig.DATABASE_ID,
				awDBconfig.COLLECTION_ID,
				awID.unique(),
				{ ...rest, userId: user.value?.id }
			);
			if (!result) throw new Error("Failed to create note");
			notification.resolve("Note created successfully");
			return mapToNoteObj(result) as NoteObj;
		} catch (error) {
			notification.reject({ title: "Error", message: error as string });
		} finally {
			loadstates.value.creatingNote = false;
		}
	};

	const updateNote = async (docId: string, update: NoteObj) => {
		const notification = push.promise("Saving note...");

		try {
			loadstates.value.savingNote = true;
			const { id, ...rest } = update;
			const result = await awDatabase.createDocument(awDBconfig.DATABASE_ID, awDBconfig.COLLECTION_ID, docId, {
				...rest,
				userId: user.value?.id,
			});
			if (!result) throw new Error("Error updating note");
			notification.resolve("Note saved successfully");
		} catch (error) {
			notification.reject({ title: "Error", message: error as string });
		} finally {
			loadstates.value.savingNote = false;
		}
	};

	const deleteNote = async (id: string) => {
		const notification = push.promise("Deleting note...");

		try {
			loadstates.value.deletingNote = true;
			await awDatabase.deleteDocument(awDBconfig.DATABASE_ID, awDBconfig.COLLECTION_ID, id);
			notification.resolve("Note deleted successfully");
		} catch (error) {
			notification.reject({ title: "Error", message: error as string });
		} finally {
			loadstates.value.deletingNote = false;
		}
	};

	const getAccountPrefs = async () => {
		try {
			loadstates.value.gettingPrefs = true;
			const prefs = await awAccount.getPrefs();
			if (!Object.keys(prefs).length) {
				const { colorMode } = useThemeMode();
				const payload = {
					user: user.value?.id as string,
					colorMode: colorMode.preference as ColorMode,
					fontFamily: fontFamily.value,
				};
				const prefsRes = await setAccountPrefs(payload);
				return prefsRes;
			}
			return prefs as unknown as SettingsObj;
		} catch (error) {
			push.error({ title: "Error", message: error as string });
		} finally {
			loadstates.value.gettingPrefs = false;
		}
	};

	const setAccountPrefs = async (settings: Record<string, string>) => {
		const notification = push.promise("Setting preferences...");

		try {
			loadstates.value.isSettingPrefs = true;
			const prefs = await awAccount.updatePrefs({ ...userPrefs.value, ...settings });
			if (!prefs) throw new Error("Failed to update preferences");
			if (!Object.keys(prefs?.prefs).length) {
				const { colorMode } = useThemeMode();
				const payload = {
					user: user.value?.id as string,
					colorMode: colorMode.preference as ColorMode,
					fontFamily: fontFamily.value,
				};
				userPrefs.value = { ...prefs?.prefs, ...payload };
				return { ...prefs?.prefs, ...payload } as unknown as SettingsObj;
			}
			userPrefs.value = { ...prefs.prefs };
			notification.resolve("Account preferences updated!");
			return prefs.prefs as unknown as SettingsObj;
		} catch (error) {
			notification.reject({ title: "Error", message: error as string });
		} finally {
			loadstates.value.isSettingPrefs = false;
		}
	};

	const updatePassword = async (newPassword: string, oldPassword: string) => {
		const notification = push.promise("Updating password...");

		try {
			loadstates.value.isUpdatingPassword = true;
			const res = await awAccount.updatePassword(newPassword, oldPassword);
			if (!res) throw new Error("Ann error ocuured while updating password");
			notification.resolve("Password updated successfully");
		} catch (error) {
			notification.reject({ title: "Error", message: error as string });
		} finally {
			loadstates.value.isUpdatingPassword = false;
		}
	};

	const createPasswordRecovery = async (email: string) => {
		const notification = push.promise("Sending password recovery link...");

		try {
			loadstates.value.isRecoveringPassword = true;
			const token = await awAccount.createRecovery(email, `${import.meta.env.VITE_BASE_URL}/reset-password`);
			if (!token) throw new Error("Failed to create recovery token");
			notification.resolve("Password recovery link sent to your email");
		} catch (error) {
			notification.reject({ title: "Error", message: error as string });
		} finally {
			loadstates.value.isRecoveringPassword = false;
		}
	};

	const resetPassword = async (userId: string, password: string, token: string) => {
		const notification = push.promise("Resetting password...");

		try {
			loadstates.value.isRecoveringPassword = true;
			const res = await awAccount.updateRecovery(userId, token, password);
			if (!res) throw new Error("Failed to reset password");
			navigateTo({ name: "login" });
			notification.resolve("Password reset successfully");
		} catch (error) {
			notification.reject({ title: "Error", message: error as string });
		} finally {
			loadstates.value.isRecoveringPassword = false;
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
		createPasswordRecovery,
		resetPassword,
	};
};
