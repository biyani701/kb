import Link from 'next/link'
import { getDb } from '@/db'
import { listDomains, listTopics, topicUrl } from '@/kb/queries'

export default async function Home() {
  const db = await getDb()
  const [domains, topics] = await Promise.all([listDomains(db), listTopics(db)])
  return (
    <>
      <h1 className="text-3xl font-semibold">Knowledge base</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Notes from two decades in payments and capital markets, and a <Link href="/glossary" className="underline">glossary</Link> of the
        terms that come up.
      </p>
      <div className="mt-10 grid gap-10">
        {domains.map((domain) => (
          <section key={domain.id} aria-labelledby={`domain-${domain.id}`}>
            <h2 id={`domain-${domain.id}`} className="text-xl font-semibold">
              {domain.name}
            </h2>
            <p className="mt-1 text-muted">{domain.summary}</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {topics
                .filter((t) => t.domain === domain.id)
                .map((topic) => (
                  <li key={topic.slug}>
                    <Link href={topicUrl(topic.domain, topic.slug)} className="block h-full rounded-lg border border-rule p-4 hover:border-accent">
                      <span className="font-medium">{topic.title}</span>
                      <span className="mt-1 block text-sm text-muted">{topic.summary}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  )
}
