import { databaseUrl, neonDb } from '../src/db/client'
import { migrate } from '../src/db/migrate'
import { loadSeed, writeSeed } from '../src/kb/seed'

// `pnpm db:migrate` and `pnpm db:seed`, against DATABASE_URL (.env.local locally; the Vercel build sets it per
// deployment, so a preview migrates and seeds its own Neon branch).

async function main(command: string | undefined) {
  const db = neonDb(databaseUrl())
  if (command === 'migrate') {
    const applied = await migrate(db)
    console.log(`migrations: ${applied.length ? applied.join(', ') : 'up to date'}`)
  } else if (command === 'seed') {
    const counts = await writeSeed(db, await loadSeed())
    console.log(`seeded: ${counts.domains} domains, ${counts.topics} topics, ${counts.terms} terms`)
  } else {
    throw new Error('usage: tsx scripts/db.ts migrate|seed')
  }
}

main(process.argv[2]).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
