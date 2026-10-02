import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { migrate } from '../db/migrate'
import { pgliteDb } from '../db/testing'
import { getTerm, getTopic, listDomains, listTerms, listTopics, search } from './queries'
import { loadSeed, parseTopic, writeSeed, type Seed } from './seed'

const db = pgliteDb()
let seed: Seed

beforeAll(async () => {
  await migrate(db)
  seed = await loadSeed()
  await writeSeed(db, seed)
}, 60_000)
afterAll(() => db.close())

describe('the seed', () => {
  it('is everything carried over from the portfolio: 3 domains, 10 topics, 68 terms', () => {
    expect([seed.domains.length, seed.topics.length, seed.terms.length]).toEqual([3, 10, 68])
  })

  it('is written to the database and can be re-run without duplicates', async () => {
    expect(await writeSeed(db, seed)).toEqual({ domains: 3, topics: 10, terms: 68 })
    expect(await listTerms(db)).toHaveLength(68)
    expect((await listDomains(db)).map((d) => d.id)).toEqual(['credit-cards-payments', 'market-reference-data', 'capital-markets'])
  })

  it('removes rows that are no longer in content/', async () => {
    await writeSeed(db, { ...seed, terms: seed.terms.slice(1) })
    expect(await listTerms(db)).toHaveLength(67)
    await writeSeed(db, seed)
    expect(await listTerms(db)).toHaveLength(68)
  })

  it('names the file and field when a topic is invalid', async () => {
    await expect(parseTopic('content/knowledge/x/y.md', '---\nslug: "y"\n---\nBody')).rejects.toThrow(/^content\/knowledge\/x\/y\.md: domain: /)
  })
})

describe('queries', () => {
  it('reads a term with its rendered details', async () => {
    const term = await getTerm(db, 'atc')
    expect(term).toMatchObject({ term: 'ATC', fullForm: 'Application Transaction Counter', category: 'General' })
    expect(term!.html).toContain('<strong>Purpose:</strong>')
    expect(await getTerm(db, 'nope')).toBeUndefined()
  })

  it('reads the 3-D Secure flow with its five steps', async () => {
    const topic = await getTopic(db, 'credit-cards-payments', '3ds-flow')
    expect(topic).toMatchObject({ title: 'The 3-D Secure flow', domainName: 'Credit cards & payments' })
    expect(topic!.steps).toHaveLength(5)
    expect(await listTopics(db, 'capital-markets')).toHaveLength(3)
  })

  it('filters terms by category', async () => {
    const payments = await listTerms(db, 'Payments')
    expect(payments.length).toBeGreaterThan(0)
    expect(payments.every((t) => t.category === 'Payments')).toBe(true)
  })
})

describe('search', () => {
  it('puts the term whose abbreviation matches first', async () => {
    const [first] = await search(db, 'cavv')
    expect(first).toMatchObject({ kind: 'term', title: 'CAVV', url: '/glossary/cavv' })
  })

  it('matches an abbreviation prefix', async () => {
    expect((await search(db, 'cav')).map((h) => h.title)).toContain('CAVV')
  })

  it('finds topics by words in their body', async () => {
    const hits = await search(db, 'authentication cardholder')
    expect(hits.some((h) => h.kind === 'topic' && h.url === '/topics/credit-cards-payments/3ds-flow')).toBe(true)
  })

  it('finds every topic that mentions a word, matching word forms', async () => {
    const urls = (await search(db, 'settlements', 50)).map((h) => h.url)
    expect(urls).toEqual(expect.arrayContaining(['/topics/capital-markets/post-trade-processing', '/topics/credit-cards-payments/payment-processing']))
  })

  it('returns nothing for an empty query and treats LIKE characters literally', async () => {
    expect(await search(db, '   ')).toEqual([])
    expect(await search(db, '%')).toEqual([])
  })
})
