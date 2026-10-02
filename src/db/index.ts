import 'server-only'
import { connection } from 'next/server'
import { databaseUrl, neonDb, type Db } from './client'

let db: Promise<Db> | undefined

/**
 * The database for a page or route handler. Waits for the request first, so nothing that reads the database is
 * prerendered at build time (builds and CI need no DATABASE_URL).
 *
 * In `next dev` without DATABASE_URL, it is an in-process PGlite database, migrated and seeded from content/ on
 * first use, so the site runs locally with no Neon setup. Production always needs DATABASE_URL.
 */
export async function getDb(): Promise<Db> {
  await connection()
  db ??= process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL?.trim() ? localDb() : Promise.resolve(neonDb(databaseUrl()))
  return db
}

async function localDb(): Promise<Db> {
  const [{ pgliteDb }, { migrate }, { loadSeed, writeSeed }] = await Promise.all([import('./testing'), import('./migrate'), import('../kb/seed')])
  const local = pgliteDb()
  await migrate(local)
  await writeSeed(local, await loadSeed())
  console.log('kb: using an in-process PGlite database seeded from content/ (set DATABASE_URL to use Neon)')
  return local
}
