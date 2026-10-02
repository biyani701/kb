import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { StepFlow } from '@/components/StepFlow'
import { getDb } from '@/db'
import { getTopic } from '@/kb/queries'

async function load(props: PageProps<'/topics/[domain]/[slug]'>) {
  const { domain, slug } = await props.params
  return getTopic(await getDb(), domain, slug)
}

export async function generateMetadata(props: PageProps<'/topics/[domain]/[slug]'>): Promise<Metadata> {
  const topic = await load(props)
  return topic ? { title: topic.title, description: topic.summary } : {}
}

export default async function TopicPage(props: PageProps<'/topics/[domain]/[slug]'>) {
  const topic = await load(props)
  if (!topic) notFound()

  return (
    <article>
      <p className="text-sm text-muted">
        <Link href="/" className="underline">
          {topic.domainName}
        </Link>
      </p>
      <h1 className="mt-2 text-3xl font-semibold">{topic.title}</h1>
      <p className="mt-2 text-lg text-muted">{topic.summary}</p>
      {topic.steps && <StepFlow steps={topic.steps} className="mt-8" />}
      {/* Sanitised when seeded (src/lib/markdown.ts). */}
      <div className="prose mt-8" dangerouslySetInnerHTML={{ __html: topic.html }} />
    </article>
  )
}
