// Schema migrations, applied in order by migrate.ts (`pnpm db:migrate`, run by the Vercel build). Never edit or
// reorder an applied migration: add a new one. Each one's statements run in a single transaction.

export interface Migration {
  /** Sortable and unique, e.g. 0002_add_something. Recorded in schema_migrations once applied. */
  id: string
  statements: string[]
}

export const migrations: Migration[] = [
  {
    // Domains group topics; terms are the glossary. Markdown is stored with its rendered, sanitised HTML.
    // `search` is a weighted tsvector (title A, subtitle B, body C) kept by Postgres; the GIN index serves
    // websearch_to_tsquery in src/kb/queries.ts.
    id: '0001_knowledge_base',
    statements: [
      `create table domains (
        id text primary key,
        name text not null,
        short text not null,
        summary text not null,
        position integer not null
      )`,
      `create table topics (
        domain_id text not null references domains (id) on delete cascade,
        slug text not null,
        title text not null,
        summary text not null,
        position integer not null,
        steps jsonb,
        body_md text not null,
        body_html text not null,
        updated_at timestamptz not null default now(),
        search tsvector generated always as (
          setweight(to_tsvector('english', title), 'A') ||
          setweight(to_tsvector('english', summary), 'B') ||
          setweight(to_tsvector('english', body_md), 'C')
        ) stored,
        primary key (domain_id, slug)
      )`,
      'create index topics_search on topics using gin (search)',
      `create table terms (
        id text primary key,
        term text not null,
        full_form text not null,
        category text not null check (category in ('General', 'Finance', 'Payments', 'Technology', 'Business')),
        details_md text not null,
        details_html text not null,
        updated_at timestamptz not null default now(),
        search tsvector generated always as (
          setweight(to_tsvector('simple', term), 'A') ||
          setweight(to_tsvector('english', full_form), 'A') ||
          setweight(to_tsvector('english', details_md), 'C')
        ) stored
      )`,
      'create index terms_search on terms using gin (search)',
      'create index terms_term_lower on terms (lower(term))',
    ],
  },
]
