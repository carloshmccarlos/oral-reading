import { config as loadEnv } from 'dotenv'
import { Pool } from 'pg'

import { drizzle } from 'drizzle-orm/node-postgres'

import * as schema from './schema'

// Load env for Node-run scripts (like db:seed) where Next.js does not auto-load .env files.
loadEnv({ path: '.env.local' })
loadEnv()

// Keep a single Pool instance in development to avoid connection exhaustion during HMR.
const globalForDb = globalThis as unknown as { pgPool?: Pool }

if (!process.env.DATABASE_URL) {
  throw new Error('Missing DATABASE_URL. Add it to .env.local (recommended) or set it in your shell environment.')
}

export const pool =
  globalForDb.pgPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL
  })

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pgPool = pool
}

export const db = drizzle(pool, { schema })
