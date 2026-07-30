import { z } from "zod"

const trimmedText = (max: number) => z.string().trim().max(max)

export const noteIdSchema = z.uuid()
export const noteShareTokenSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/)

export const createNoteSchema = z.object({
  id: z.uuid().optional(),
  title: trimmedText(240).default(""),
  content: z.string().max(250_000).default(""),
  tagNames: z.array(trimmedText(40).min(1)).max(20).default([]),
  clientUpdatedAt: z.iso.datetime().optional(),
})

export const updateNoteSchema = z
  .object({
    title: trimmedText(240).optional(),
    content: z.string().max(250_000).optional(),
    tagNames: z.array(trimmedText(40).min(1)).max(20).optional(),
    expectedVersion: z.number().int().positive(),
    clientUpdatedAt: z.iso.datetime().optional(),
  })
  .refine((input) => input.title !== undefined || input.content !== undefined || input.tagNames !== undefined, {
    message: "At least one note field is required",
  })

export const versionMutationSchema = z.object({
  expectedVersion: z.number().int().positive(),
})

export const notesQuerySchema = z.object({
  cursor: z.iso.datetime().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(40),
  archived: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((value) => value === "true"),
  tag: trimmedText(40).optional(),
})

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(200),
  limit: z.coerce.number().int().min(1).max(100).default(40),
})

export type CreateNoteBody = z.infer<typeof createNoteSchema>
export type UpdateNoteBody = z.infer<typeof updateNoteSchema>
