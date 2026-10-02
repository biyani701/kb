import { getDb } from '@/db'
import { listTerms, termUrl } from '@/kb/queries'
import { SITE } from '@/lib/site'

/** GET /api/terms → { terms: [{ id, term, fullForm, category, url }] }, alphabetical. */
export async function GET() {
  const terms = await listTerms(await getDb())
  return Response.json(
    { terms: terms.map((t) => ({ ...t, url: `${SITE.url}${termUrl(t.id)}` })) },
    { headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } },
  )
}
