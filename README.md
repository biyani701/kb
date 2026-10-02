# kb

A knowledge base for **kb.biyani.xyz**: payments, card networks, capital markets and market reference data, plus a
glossary of 68 terms. It was split out of the portfolio
([vishal-portfolio](https://github.com/biyani701/vishal-portfolio), bead `vishal-portfolio-9cm.16`), which links
here from its Work section.

## Architecture

- **Next.js 16** (App Router) on **Vercel**. Pages read the database per request; nothing that touches the
  database is prerendered, so builds and CI need no database.
- **Neon Postgres** through the Vercel Marketplace (`DATABASE_URL`), with Neon's HTTP driver (`src/db/client.ts`).
  Tests use **PGlite**, a real Postgres in-process, so migrations, seeding and search run against real SQL.
- **Schema** (`src/db/migrations.ts`): `domains`, `topics` (with an optional `steps` list for interactive flows)
  and `terms`. Markdown is stored together with its sanitised HTML, rendered once when seeded.
- **Search** (`src/kb/queries.ts`): Postgres full-text search on a weighted `tsvector` per row (title, then
  subtitle, then body) with a GIN index. A term whose abbreviation starts with the query ranks first, so `3ds` or
  `cav` find their term.
- **Content** in `content/` is the seed: `content/glossary.ts`, `content/knowledge/domains.ts` and one Markdown
  file per topic in `content/knowledge/<domain>/<slug>.md`, validated with zod (`content/schema.ts`). The
  database mirrors it: `pnpm db:seed` upserts every record and deletes rows that are no longer in `content/`.

| Route | What |
|---|---|
| `/` | Domains and their topics |
| `/topics/<domain>/<slug>` | A topic; the 3-D Secure flow has an interactive step view |
| `/glossary`, `/glossary?category=Payments` | All terms, or one category |
| `/glossary/<id>` | One term |
| `/search?q=…` | Search (a plain GET form, works without JavaScript) |
| `GET /api/search?q=…&limit=…` | `{ query, hits: [{ kind, title, subtitle, url, rank }] }` |
| `GET /api/terms`, `GET /api/terms/<id>` | The glossary as JSON |

The JSON API is public, read-only and CORS-open (`Access-Control-Allow-Origin: *`), so the portfolio's Ask can
query it later.

## Development

```bash
pnpm install
pnpm dev           # http://localhost:3000
pnpm test          # vitest on PGlite: migrations, seed, queries, search
pnpm typecheck
pnpm lint
pnpm build
```

Without `DATABASE_URL`, `pnpm dev` uses an in-process PGlite database that is migrated and seeded from
`content/` on first use, so no Neon setup is needed locally. To use Neon instead, put `DATABASE_URL` in
`.env.local` (see `.env.example`) and run `pnpm db:migrate && pnpm db:seed`.

## Database

```bash
pnpm db:migrate    # applies new migrations in src/db/migrations.ts
pnpm db:seed       # writes content/ to the database
```

Never edit an applied migration; add a new one. The Vercel build runs both before `next build` (`vercel.json`),
so every deployment's database matches its code and content.

## Deploy (not set up yet)

1. Vercel → **Add New → Project** → import `biyani701/kb` (framework Next.js).
2. Project → **Storage → Connect Database → Neon** (Vercel Marketplace). This sets `DATABASE_URL` for every
   environment and gives each preview its own Neon branch. Turn on automatic deletion of preview branches in the
   integration's settings, or old ones hit the free plan's branch limit.
3. Set `SITE_URL=https://kb.biyani.xyz` for Production, then redeploy.
4. Add the domain `kb.biyani.xyz` in the project, then in Namecheap add `CNAME kb → cname.vercel-dns.com.`

## Licence

The code is under the MIT License ([LICENSE](LICENSE)). The content in `content/` is © Vishal Biyani, all rights
reserved.
