import { getDb } from '@/db'
import { getTerm, termUrl } from '@/kb/queries'
import { SITE } from '@/lib/site'

/** GET /api/terms/:id → { id, term, fullForm, category, html, url } or 404. */
export async function GET(_request: Request, ctx: RouteContext<'/api/terms/[id]'>) {
  const { id } = await ctx.params
  const term = await getTerm(await getDb(), id)
  if (!term) return Response.json({ error: 'not found' }, { status: 404 })
  return Response.json(
    { ...term, url: `${SITE.url}${termUrl(term.id)}` },
    { headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } },
  )
}
