import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

export const isDatabaseConfigured = Boolean(
  connectionString && !connectionString.includes('ep-sample')
);

// Lazy Neon client initialization
let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!_db && isDatabaseConfigured) {
    const sql = neon(connectionString!);
    _db = drizzle(sql, { schema });
  }
  return _db;
}

export { schema };
