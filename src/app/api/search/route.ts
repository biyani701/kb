import { getDb } from '@/db'
import { MAX_QUERY, search } from '@/kb/queries'
import { SITE } from '@/lib/site'

/** GET /api/search?q=…&limit=… → { query, hits: [{ kind, title, subtitle, url, rank }] }, URLs absolute. */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const query = params.get('q')?.trim() ?? ''
  if (!query) return Response.json({ error: 'q is required' }, { status: 400 })
  if (query.length > MAX_QUERY) return Response.json({ error: `q is longer than ${MAX_QUERY} characters` }, { status: 400 })
  const limit = Math.min(Math.max(Number(params.get('limit')) || 20, 1), 50)

  const hits = await search(await getDb(), query, limit)
  return Response.json(
    { query, hits: hits.map((hit) => ({ ...hit, url: `${SITE.url}${hit.url}` })) },
    { headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' } },
  )
}
