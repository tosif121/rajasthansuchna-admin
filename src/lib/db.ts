import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn("DATABASE_URL is not configured in environment.");
}

export const sql = databaseUrl ? neon(databaseUrl) : (null as any);
