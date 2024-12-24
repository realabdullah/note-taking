/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";

export const authFormSchema = z.object({
	email: z.string({ required_error: "Email address is required" }).email({ message: "Invalid email address" }),
	password: z.string({ required_error: "Password is required" }).min(8, "Must be at least 8 characters"),
});

export type authFormSchemaType = z.output<typeof authFormSchema>;

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
		token: z.string(),
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
	return text?.toString()?.toLowerCase()?.replace(/\s/g, "-");
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
