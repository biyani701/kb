import type { Metadata } from 'next'
import Link from 'next/link'
import { glossaryCategories } from '../../../content/schema'
import { getDb } from '@/db'
import { listTerms, termUrl } from '@/kb/queries'
import { cn } from '@/lib/cn'

export const metadata: Metadata = { title: 'Glossary', description: 'Payments and financial-services terms and abbreviations.' }

export default async function GlossaryPage(props: PageProps<'/glossary'>) {
  const { category: raw } = await props.searchParams
  const category = glossaryCategories.find((c) => c === raw)
  const terms = await listTerms(await getDb(), category)

  return (
    <>
      <h1 className="text-3xl font-semibold">Glossary</h1>
      <nav aria-label="Categories" className="mt-6 flex flex-wrap gap-2">
        {[undefined, ...glossaryCategories].map((c) => (
          <Link
            key={c ?? 'all'}
            href={c ? `/glossary?category=${c}` : '/glossary'}
            aria-current={c === category ? 'page' : undefined}
            className={cn('inline-flex min-h-11 items-center rounded-full border border-rule px-4', c === category && 'bg-foreground text-background')}
          >
            {c ?? 'All'}
          </Link>
        ))}
      </nav>
      <p className="mt-6 text-sm text-muted">{terms.length} terms</p>
      <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-[max-content_1fr]">
        {terms.map((term) => (
          <div key={term.id} className="contents">
            <dt className="font-medium">
              <Link href={termUrl(term.id)} className="hover:text-accent">
                {term.term}
              </Link>
            </dt>
            <dd className="text-muted">{term.fullForm}</dd>
          </div>
        ))}
      </dl>
    </>
  )
}
