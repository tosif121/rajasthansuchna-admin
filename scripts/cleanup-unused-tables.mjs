import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { neon } from '@neondatabase/serverless';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let databaseUrl = process.argv[2] || process.env.DATABASE_URL;

if (!databaseUrl || databaseUrl.includes('ep-sample')) {
  const envLocalPath = path.join(rootDir, '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const lines = fs.readFileSync(envLocalPath, 'utf-8').split('\n');
    for (const line of lines) {
      if (line.startsWith('DATABASE_URL=')) {
        const val = line.substring('DATABASE_URL='.length).trim();
        if (val && !val.includes('ep-sample')) {
          databaseUrl = val;
          break;
        }
      }
    }
  }
}

if (!databaseUrl || databaseUrl.includes('ep-sample')) {
  console.error('❌ No valid DATABASE_URL found. Pass it as an argument or add it to .env.local.');
  process.exit(1);
}

const UNUSED_TABLES = [
  'admin_user_roles',
  'admin_roles',
  'documents',
  'notice_dates',
  'workflow_events',
  'audit_logs',
];

const sql = neon(databaseUrl);

async function main() {
  console.log('🧹 Removing unused tables from Neon PostgreSQL...\n');

  for (const table of UNUSED_TABLES) {
    await sql.unsafe(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
    console.log(`   ✓ dropped ${table} (if it existed)`);
  }

  // admin_users is referenced by notice_revisions.created_by in older installs.
  await sql`ALTER TABLE notice_revisions DROP COLUMN IF EXISTS created_by;`;
  console.log('   ✓ dropped notice_revisions.created_by (if it existed)');

  await sql`DROP TABLE IF EXISTS admin_users CASCADE;`;
  console.log('   ✓ dropped admin_users (if it existed)');

  console.log('\n✅ Unused table cleanup complete.');
}

main().catch((err) => {
  console.error('❌ Cleanup failed:', err);
  process.exit(1);
});
