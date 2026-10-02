import type { Db } from './client'
import { migrations as all, type Migration } from './migrations'

/**
 * Applies every migration not yet recorded in schema_migrations, in id order, each in its own transaction
 * together with its record, so a failure leaves neither a partial schema change nor a false record.
 * Returns the ids it applied.
 */
export async function migrate(db: Db, migrations: Migration[] = all): Promise<string[]> {
  const ids = migrations.map((migration) => migration.id)
  if (new Set(ids).size !== ids.length) throw new Error('migrations: duplicate id')
  if (ids.some((id, index) => index > 0 && id <= ids[index - 1]!)) throw new Error('migrations: ids must be in ascending order')

  await db.query('create table if not exists schema_migrations (id text primary key, applied_at timestamptz not null default now())')
  const applied = new Set((await db.query<{ id: string }>('select id from schema_migrations')).map((row) => row.id))

  const done: string[] = []
  for (const migration of migrations) {
    if (applied.has(migration.id)) continue
    await db.transaction([
      ...migration.statements.map((text) => ({ text })),
      { text: 'insert into schema_migrations (id) values ($1)', params: [migration.id] },
    ])
    done.push(migration.id)
  }
  return done
}
