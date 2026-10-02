import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { parse as parseYaml } from 'yaml'
import { z } from 'zod'
import { glossary } from '../../content/glossary'
import { domains } from '../../content/knowledge/domains'
import { domainSchema, glossaryTermSchema, topicMetaSchema, type Domain, type GlossaryTerm, type TopicMeta } from '../../content/schema'
import type { Db, Statement } from '../db/client'
import { renderMarkdown } from '../lib/markdown'

// The seed: content/ (from vishal-portfolio) validated and rendered, then written to the database in one
// transaction. The database mirrors content/ exactly, so rows no longer in content/ are removed. Every
// validation failure names the file and the field.

export const CONTENT_DIR = join(process.cwd(), 'content')

export class SeedError extends Error {
  override name = 'SeedError'
}

export interface Topic extends TopicMeta {
  body: string
  html: string
}

export interface Seed {
  domains: Domain[]
  topics: Topic[]
  terms: (GlossaryTerm & { html: string })[]
}

function validate<S extends z.ZodType>(file: string, schema: S, value: unknown): z.infer<S> {
  const result = schema.safeParse(value)
  if (result.success) return result.data
  const message = result.error.issues.map((issue) => `${file}: ${issue.path.join('.') || '(root)'}: ${issue.message}`)
  throw new SeedError(message.join('\n'))
}

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/

export async function parseTopic(file: string, source: string): Promise<Topic> {
  const match = FRONT_MATTER.exec(source)
  if (!match) throw new SeedError(`${file}: missing front matter`)
  const meta = validate(file, topicMetaSchema, parseYaml(match[1]!))
  if (!file.endsWith(`/${meta.domain}/${meta.slug}.md`)) throw new SeedError(`${file}: slug and domain must match the path`)
  return { ...meta, body: match[2]!.trim(), html: await renderMarkdown(match[2]!) }
}

/** Reads, validates and renders content/. */
export async function loadSeed(dir = CONTENT_DIR): Promise<Seed> {
  const seedDomains = domains.map((domain, i) => validate(`content/knowledge/domains.ts[${i}]`, domainSchema, domain))
  const domainIds = new Set(seedDomains.map((d) => d.id))

  const topics: Topic[] = []
  for (const domain of seedDomains) {
    const folder = join(dir, 'knowledge', domain.id)
    for (const name of (await readdir(folder)).filter((n) => n.endsWith('.md')).sort()) {
      const file = `content/knowledge/${domain.id}/${name}`
      topics.push(await parseTopic(file, await readFile(join(folder, name), 'utf8')))
    }
  }
  for (const topic of topics) {
    if (!domainIds.has(topic.domain)) throw new SeedError(`content/knowledge/${topic.domain}/${topic.slug}.md: domain: unknown`)
  }

  const terms = await Promise.all(
    glossary.map(async (term, i) => {
      const valid = validate(`content/glossary.ts[${i}]`, glossaryTermSchema, term)
      return { ...valid, html: await renderMarkdown(valid.details) }
    }),
  )
  const ids = terms.map((t) => t.id)
  const duplicate = ids.find((id, i) => ids.indexOf(id) !== i)
  if (duplicate) throw new SeedError(`content/glossary.ts: id: "${duplicate}" is used twice`)

  return { domains: seedDomains, topics, terms }
}

/** Writes the seed in one transaction: upserts every record and deletes rows that are no longer in it. */
export async function writeSeed(db: Db, seed: Seed) {
  const statements: Statement[] = []
  seed.domains.forEach((d, position) =>
    statements.push({
      text: `insert into domains (id, name, short, summary, position) values ($1, $2, $3, $4, $5)
             on conflict (id) do update set name = excluded.name, short = excluded.short, summary = excluded.summary, position = excluded.position`,
      params: [d.id, d.name, d.short, d.summary, position],
    }),
  )
  for (const t of seed.topics) {
    statements.push({
      text: `insert into topics (domain_id, slug, title, summary, position, steps, body_md, body_html) values ($1, $2, $3, $4, $5, $6, $7, $8)
             on conflict (domain_id, slug) do update set title = excluded.title, summary = excluded.summary, position = excluded.position,
               steps = excluded.steps, body_md = excluded.body_md, body_html = excluded.body_html, updated_at = now()`,
      params: [t.domain, t.slug, t.title, t.summary, t.order, t.steps ? JSON.stringify(t.steps) : null, t.body, t.html],
    })
  }
  for (const t of seed.terms) {
    statements.push({
      text: `insert into terms (id, term, full_form, category, details_md, details_html) values ($1, $2, $3, $4, $5, $6)
             on conflict (id) do update set term = excluded.term, full_form = excluded.full_form, category = excluded.category,
               details_md = excluded.details_md, details_html = excluded.details_html, updated_at = now()`,
      params: [t.id, t.term, t.fullForm, t.category, t.details, t.html],
    })
  }
  statements.push(
    { text: 'delete from terms where not (id = any($1::text[]))', params: [seed.terms.map((t) => t.id)] },
    {
      text: `delete from topics where not ((domain_id || '/' || slug) = any($1::text[]))`,
      params: [seed.topics.map((t) => `${t.domain}/${t.slug}`)],
    },
    { text: 'delete from domains where not (id = any($1::text[]))', params: [seed.domains.map((d) => d.id)] },
  )
  await db.transaction(statements)
  return { domains: seed.domains.length, topics: seed.topics.length, terms: seed.terms.length }
}
