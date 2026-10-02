import type { Db } from '../db/client'

// Read queries for the pages and the JSON API. All parameterised; nothing is interpolated into SQL.

export interface DomainRow {
  id: string
  name: string
  short: string
  summary: string
}

export interface TopicSummary {
  domain: string
  slug: string
  title: string
  summary: string
}

export interface Topic extends TopicSummary {
  domainName: string
  steps: { title: string; detail: string }[] | null
  html: string
}

export interface TermSummary {
  id: string
  term: string
  fullForm: string
  category: string
}

export interface Term extends TermSummary {
  html: string
}

export interface SearchHit {
  kind: 'term' | 'topic'
  title: string
  subtitle: string
  url: string
  rank: number
}

export const termUrl = (id: string) => `/glossary/${id}`
export const topicUrl = (domain: string, slug: string) => `/topics/${domain}/${slug}`

export async function listDomains(db: Db) {
  return db.query<DomainRow>('select id, name, short, summary from domains order by position')
}

export async function listTopics(db: Db, domain?: string) {
  return db.query<TopicSummary>(
    `select domain_id as domain, slug, title, summary from topics
     where $1::text is null or domain_id = $1 order by domain_id, position, slug`,
    [domain ?? null],
  )
}

export async function getTopic(db: Db, domain: string, slug: string): Promise<Topic | undefined> {
  const [row] = await db.query<Topic>(
    `select t.domain_id as domain, t.slug, t.title, t.summary, d.name as "domainName", t.steps, t.body_html as html
     from topics t join domains d on d.id = t.domain_id where t.domain_id = $1 and t.slug = $2`,
    [domain, slug],
  )
  return row
}

export async function listTerms(db: Db, category?: string) {
  return db.query<TermSummary>(
    `select id, term, full_form as "fullForm", category from terms
     where $1::text is null or category = $1 order by lower(term), id`,
    [category ?? null],
  )
}

export async function getTerm(db: Db, id: string): Promise<Term | undefined> {
  const [row] = await db.query<Term>(
    'select id, term, full_form as "fullForm", category, details_html as html from terms where id = $1',
    [id],
  )
  return row
}

export const MAX_QUERY = 200

/**
 * Full-text search over terms and topics, best first. A term whose abbreviation starts with the query ranks
 * first, so "3ds" or "cav" find their term even when the words don't match.
 */
export async function search(db: Db, query: string, limit = 20): Promise<SearchHit[]> {
  const q = query.trim().slice(0, MAX_QUERY)
  if (!q) return []
  return db.query<SearchHit>(
    `with q as (select websearch_to_tsquery('english', $1) as english, websearch_to_tsquery('simple', $1) as simple)
     select * from (
       select 'term' as kind, term as title, full_form as subtitle, '/glossary/' || id as url,
              (case when lower(term) like lower($2) || '%' then 10 else 0 end) + ts_rank(search, q.english) + ts_rank(search, q.simple) as rank
       from terms, q
       where search @@ q.english or search @@ q.simple or lower(term) like lower($2) || '%'
       union all
       select 'topic', title, summary, '/topics/' || domain_id || '/' || slug, ts_rank(search, q.english)
       from topics, q
       where search @@ q.english
     ) hits
     order by rank desc, title
     limit $3`,
    [q, q.replace(/[%_\\]/g, '\\$&'), limit],
  )
}
