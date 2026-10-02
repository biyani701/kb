import type { Metadata } from 'next'
import Link from 'next/link'
import { SearchForm } from '@/components/SearchForm'
import { getDb } from '@/db'
import { search } from '@/kb/queries'

export const metadata: Metadata = { title: 'Search', robots: { index: false } }

export default async function SearchPage(props: PageProps<'/search'>) {
  const { q } = await props.searchParams
  const query = typeof q === 'string' ? q : ''
  const hits = query ? await search(await getDb(), query) : []

  return (
    <>
      <h1 className="text-3xl font-semibold">Search</h1>
      <SearchForm defaultValue={query} className="mt-6" />
      {query && (
        <p className="mt-6 text-muted" role="status">
          {hits.length === 0 ? `Nothing matches “${query}”.` : `${hits.length} ${hits.length === 1 ? 'result' : 'results'} for “${query}”.`}
        </p>
      )}
      <ol className="mt-6 flex flex-col gap-4">
        {hits.map((hit) => (
          <li key={hit.url}>
            <Link href={hit.url} className="block rounded-lg border border-rule p-4 hover:border-accent">
              <span className="text-sm text-muted">{hit.kind === 'term' ? 'Glossary' : 'Topic'}</span>
              <span className="mt-1 block font-medium">{hit.title}</span>
              <span className="mt-1 block text-sm text-muted">{hit.subtitle}</span>
            </Link>
          </li>
        ))}
      </ol>
    </>
  )
}
