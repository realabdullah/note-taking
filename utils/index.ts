/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";

const securityQuestionSchema = z.object({
	question: z.string({ required_error: "Question is required" }),
	answer: z.string({ required_error: "Answer is required" }),
});

export const authFormSchema = z
	.object({
		email: z.string({ required_error: "Email address is required" }).email({ message: "Invalid email address" }),
		password: z.string({ required_error: "Password is required" }).min(8, "Must be at least 8 characters"),
		securityQuestions: z.array(securityQuestionSchema),
		serverType: z.enum(["server", "indexeddb", "appwrite"]),
		showSecurityQuestions: z.boolean(),
	})
	.superRefine((data, ctx) => {
		if (
			data.serverType === "indexeddb" &&
			data.showSecurityQuestions &&
			(!data.securityQuestions || data.securityQuestions.length < 1)
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "At least one security question is required",
				path: ["securityQuestions"],
			});
		}
	});

export type authFormSchemaType = z.output<typeof authFormSchema>;

export const authLoginFormSchema = z.object({
	email: z.string({ required_error: "Email address is required" }).email({ message: "Invalid email address" }),
	password: z.string({ required_error: "Password is required" }),
});

export type authLoginFormSchemaType = z.output<typeof authLoginFormSchema>;

export const forgotPasswordFormSchema = z.object({
	email: z.string({ message: "Email address is required" }).email({ message: "Invalid email address" }),
});

export type forgotPasswordFormSchemaType = z.output<typeof forgotPasswordFormSchema>;

export const resetPasswordFormSchema = z
	.object({
		password: z.string({ required_error: "Password is required" }).min(8, "Must be at least 8 characters"),
		confirmPassword: z.string({
			required_error: "Confirm password is required",
		}),
	})
	.refine(data => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export type resetPasswordFormSchemaType = z.output<typeof resetPasswordFormSchema>;

export const changePasswordSchema = z
	.object({
		oldPassword: z.string({ required_error: "Old password is required" }),
		password: z.string({ required_error: "Password is required" }).min(8, "Must be at least 8 characters"),
		confirmPassword: z.string({
			required_error: "Confirm password is required",
		}),
	})
	.refine(data => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export type changePasswordSchemaType = z.output<typeof changePasswordSchema>;

interface ColorReplaceOptions {
	fill?: string;
	stroke?: string;
}

export const replaceIconColors = (svg: string, options: ColorReplaceOptions = {}): string => {
	const { isDark } = useThemeMode();
	const { fill = "#ffffff", stroke = "#ffffff" } = options;

	if (!isDark.value) return svg;

	const replaceColors = (attribute: "fill" | "stroke", newColor: string) => {
		const colorRegex = new RegExp(`${attribute}=["']#[0-9A-Fa-f]{6}["']`, "g");
		return svg.replace(colorRegex, `${attribute}="${newColor}"`);
	};

	let modifiedSvg = svg;

	if (svg.includes("stroke=")) modifiedSvg = replaceColors("stroke", stroke);
	if (svg.includes("fill=")) modifiedSvg = replaceColors("fill", fill);

	return modifiedSvg;
};

export const customiseIcon = (content: string): string => {
	const svg = content;
	return replaceIconColors(svg);
};

export const slugify = (text: string): string => {
	return text
		?.toString()
		?.toLowerCase()
		?.replace(/[^a-z0-9]/g, "-")
		?.replace(/\\-+/g, "-")
		?.replace(/^-|-$/g, "");
};

export const formatDate = (date: Date | string) => useDateFormat(date, "Do, MMMM YYYY. h:mm A");

type SerializableValue = string | number | boolean | null | Date | SerializableObject | SerializableValue[];

interface SerializableObject {
	[key: string]: SerializableValue;
}

const isDate = (value: unknown): value is Date => value instanceof Date && !isNaN(value.valueOf());

const isObject = (value: unknown): value is object =>
	typeof value === "object" && value !== null && !Array.isArray(value);

export const serialize = <T>(obj: T): T => {
	if (!isObject(obj)) return obj;

	const serialized = {} as T;

	Object.entries(obj as Record<string, unknown>).forEach(([key, value]) => {
		if (isDate(value)) {
			(serialized as any)[key] = value.toISOString();
		} else if (Array.isArray(value)) {
			(serialized as any)[key] = value.map(item => (isObject(item) ? serialize(item) : item));
		} else if (isObject(value)) {
			(serialized as any)[key] = serialize(value);
		} else {
			(serialized as any)[key] = value;
		}
	});

	return serialized;
};

export const deserialize = <T>(obj: T): T => {
	if (!isObject(obj)) return obj;

	const deserialized = {} as T;

	Object.entries(obj as Record<string, unknown>).forEach(([key, value]) => {
		if (typeof value === "string") {
			const dateTest = Date.parse(value);
			if (!isNaN(dateTest) && value.includes("T")) {
				(deserialized as any)[key] = new Date(value);
			} else {
				(deserialized as any)[key] = value;
			}
		} else if (Array.isArray(value)) {
			(deserialized as any)[key] = value.map(item => (isObject(item) ? deserialize(item) : item));
		} else if (isObject(value)) {
			(deserialized as any)[key] = deserialize(value);
		} else {
			(deserialized as any)[key] = value;
		}
	});

	return deserialized;
};

/**
 * Creates a NoteObj from a source object
 * @param item - Source object with at least an $id field
 * @returns NoteObj
 */
const createNoteObj = <T extends { $id: string }>(item: T): NoteObj => {
	return {
		id: item.$id,
		slug: "slug" in item ? String(item.slug) : "",
		title: "title" in item ? String(item.title) : "",
		content: "content" in item ? String(item.content) : "",
		tags: "tags" in item && Array.isArray(item.tags) ? item.tags : [],
		lastEdited: "lastEdited" in item ? (item.lastEdited as string) : new Date().toISOString(),
		isArchived: "isArchived" in item ? Boolean(item.isArchived) : false,
	};
};

/**
 * Maps source data to NoteObj format. Accepts either a single object or an array.
 * @param data - Source data object or array of objects
 * @returns Single NoteObj or array of NoteObj depending on input
 */
export const mapToNoteObj = <T extends { $id: string }>(data: T | T[]): NoteObj | NoteObj[] => {
	if (Array.isArray(data)) {
		return data.map(createNoteObj);
	}
	return createNoteObj(data);
};

/**
 * Type guard to validate if an object matches NoteObj interface
 * @param obj - Object to validate
 * @returns boolean indicating if object is a valid NoteObj
 */
export const isNoteObj = (obj: unknown): obj is NoteObj => {
	const noteSchema = z.object({
		id: z.string(),
		slug: z.string(),
		title: z.string(),
		content: z.string(),
		tags: z.array(z.string()),
		lastEdited: z.union([z.string(), z.date()]),
		isArchived: z.boolean(),
	});

	return noteSchema.safeParse(obj).success;
};
