import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn("DATABASE_URL is not configured in environment.");
}

export const sql = (databaseUrl && !databaseUrl.includes('ep-sample')) ? neon(databaseUrl) : (null as any);

let dbAvailable: boolean | null = null;
let lastDbCheck = 0;

export async function isNeonReachable(customSql = sql): Promise<boolean> {
  if (!customSql) return false;
  const now = Date.now();
  const cacheTtl = dbAvailable ? 60000 : 5000;
  if (dbAvailable !== null && now - lastDbCheck < cacheTtl) {
    return dbAvailable;
  }
  try {
    const query = customSql`SELECT 1`;
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Probe Timeout')), 3500)
    );
    await Promise.race([query, timeout]);
    dbAvailable = true;
    lastDbCheck = now;
    return true;
  } catch {
    dbAvailable = false;
    lastDbCheck = now;
    return false;
  }
}

export async function safeNeonQuery<T>(queryPromise: Promise<T>, timeoutMs = 4500): Promise<T | null> {
  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Query Timeout')), timeoutMs)
    );
    return await Promise.race([queryPromise, timeout]);
  } catch {
    return null;
  }
}

