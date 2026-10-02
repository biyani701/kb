import { PGlite } from '@electric-sql/pglite'
import type { Db } from './client'

/** An empty in-memory Postgres for tests, so migrations, seeding and search run against real SQL. */
export function pgliteDb(): Db & { close(): Promise<void> } {
  const pg = new PGlite()
  return {
    async query<T>(text: string, params: unknown[] = []) {
      return (await pg.query<T>(text, params)).rows
    },
    async transaction(statements) {
      await pg.transaction(async (tx) => {
        for (const { text, params = [] } of statements) await tx.query(text, params)
      })
    },
    close: () => pg.close(),
  }
}
