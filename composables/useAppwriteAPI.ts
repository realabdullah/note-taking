export const useAppwriteAPI = (): NotesAPI => {
	const { user, loadstates, userPrefs, fontFamily } = storeToRefs(useStore());

	const signUp = async (email: string, password: string): Promise<void> => {
		try {
			loadstates.value.signingUp = true;
			await awAccount.create(awID.unique(), email, password);
			await signIn(email, password);
		} catch (error) {
			useToast().add({ title: "Error", description: error as string, color: "error" });
		} finally {
			loadstates.value.signingUp = false;
		}
	};

	const signIn = async (email: string, password: string): Promise<void> => {
		try {
			loadstates.value.signingIn = true;
			const authUser = await awAccount.createEmailPasswordSession(email, password);
			if (!authUser) throw new Error("Failed to sign in");
			user.value = { id: authUser.userId, email: authUser.providerUid };
			const prefs = await getAccountPrefs();
			if (prefs) userPrefs.value = { ...userPrefs.value, ...prefs };
			navigateTo("/");
		} catch (error) {
			useToast().add({ title: "Error", description: error as string, color: "error" });
		} finally {
			loadstates.value.signingIn = false;
		}
	};

	const logout = async (): Promise<void> => {
		try {
			loadstates.value.loggingOut = true;
			await awAccount.deleteSession("current");
			user.value = null;
			await navigateTo({ name: "login" });
		} catch (error) {
			useToast().add({ title: "Error", description: error as string, color: "error" });
		} finally {
			loadstates.value.loggingOut = false;
		}
	};

	const getAllNotes = async (archived = false): Promise<NoteObj[]> => {
		const response = await awDatabase.listDocuments(awDBconfig.DATABASE_ID, awDBconfig.COLLECTION_ID, [
			awQuery.orderDesc("$createdAt"),
			awQuery.equal("isArchived", archived),
			awQuery.limit(25),
		]);
		return mapToNoteObj(response.documents) as NoteObj[];
	};

	const getNoteByID = async (id: string): Promise<NoteObj | null> => {
		try {
			loadstates.value.fetchingNote = true;
			const note = await awDatabase.getDocument(awDBconfig.DATABASE_ID, awDBconfig.COLLECTION_ID, id);
			if (!note) return null;
			return mapToNoteObj(note) as NoteObj;
		} catch (error) {
			useToast().add({ title: "Error", description: error as string, color: "error" });
			return null;
		} finally {
			loadstates.value.fetchingNote = false;
		}
	};

	const createNote = async (noteInput: NoteObj) => {
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
			useToast().add({ title: "Success", description: "Note created successfully", color: "success" });
			return mapToNoteObj(result) as NoteObj;
		} catch (error) {
			useToast().add({ title: "Error", description: error as string, color: "error" });
		} finally {
			loadstates.value.creatingNote = false;
		}
	};

	const updateNote = async (docId: string, update: NoteObj) => {
		try {
			loadstates.value.savingNote = true;
			const { id, ...rest } = update;
			const result = await awDatabase.createDocument(awDBconfig.DATABASE_ID, awDBconfig.COLLECTION_ID, docId, {
				...rest,
				userId: user.value?.id,
			});
			if (!result) throw new Error("Error updating note");
			useToast().add({ title: "Success", description: "Note saved successfully", color: "success" });
		} catch (error) {
			useToast().add({ title: "Error", description: error as string, color: "error" });
		} finally {
			loadstates.value.savingNote = false;
		}
	};

	const deleteNote = async (id: string) => {
		try {
			loadstates.value.deletingNote = true;
			await awDatabase.deleteDocument(awDBconfig.DATABASE_ID, awDBconfig.COLLECTION_ID, id);
			useToast().add({ title: "Success", description: "Note deleted successfully", color: "success" });
		} catch (error) {
			useToast().add({ title: "Error", description: error as string, color: "error" });
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
			useToast().add({ title: "Error", description: error as string, color: "error" });
		} finally {
			loadstates.value.gettingPrefs = false;
		}
	};

	const setAccountPrefs = async (settings: Record<string, string>) => {
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
			useToast().add({ title: "Success", description: "Account preferences updated!", color: "success" });
			userPrefs.value = { ...prefs.prefs };
			return prefs.prefs as unknown as SettingsObj;
		} catch (error) {
			useToast().add({ title: "Error", description: error as string, color: "error" });
		} finally {
			loadstates.value.isSettingPrefs = false;
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
	};
};
