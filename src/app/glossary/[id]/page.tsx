import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDb } from '@/db'
import { getTerm } from '@/kb/queries'

export async function generateMetadata(props: PageProps<'/glossary/[id]'>): Promise<Metadata> {
  const term = await getTerm(await getDb(), (await props.params).id)
  return term ? { title: `${term.term}: ${term.fullForm}`, description: `${term.term} (${term.fullForm}), ${term.category}.` } : {}
}

export default async function TermPage(props: PageProps<'/glossary/[id]'>) {
  const term = await getTerm(await getDb(), (await props.params).id)
  if (!term) notFound()

  return (
    <article>
      <p className="text-sm text-muted">
        <Link href="/glossary" className="underline">
          Glossary
        </Link>{' '}
        · {term.category}
      </p>
      <h1 className="mt-2 text-3xl font-semibold">{term.term}</h1>
      <p className="mt-1 text-lg text-muted">{term.fullForm}</p>
      {/* Sanitised when seeded (src/lib/markdown.ts). */}
      <div className="prose mt-8" dangerouslySetInnerHTML={{ __html: term.html }} />
    </article>
  )
}
