import { z } from 'zod'

// The seed content model, from vishal-portfolio's content/schema.ts. content/ is validated against it by
// src/kb/seed.ts before anything is written to the database.

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'use lower-case-kebab')
const text = z.string().trim().min(1)

export const domainSchema = z.object({ id: slug, name: text, short: text, summary: text })

export const topicMetaSchema = z.object({
  slug,
  domain: slug,
  title: text,
  summary: text,
  order: z.number().int(),
  /** Interactive step sequence (the 3-D Secure flow). */
  steps: z.array(z.object({ title: text, detail: text })).optional(),
})

export const glossaryCategories = ['General', 'Finance', 'Payments', 'Technology', 'Business'] as const

export const glossaryTermSchema = z.object({
  id: slug,
  term: text,
  fullForm: text,
  category: z.enum(glossaryCategories),
  /** Markdown. */
  details: text,
})

export type Domain = z.infer<typeof domainSchema>
export type TopicMeta = z.infer<typeof topicMetaSchema>
export type GlossaryTerm = z.infer<typeof glossaryTermSchema>
