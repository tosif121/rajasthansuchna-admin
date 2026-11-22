import { connection, NextResponse } from 'next/server';
import { McqService } from '@/server/services/mcq-service';
import { getCachedOrFetch } from '@/server/cache';

export async function GET() {
  const start = Date.now();
  await connection();
  const data = await getCachedOrFetch('mcq-tests:list:active', 30, () => McqService.getAllTests(false));
  const durationMs = Date.now() - start;

  return NextResponse.json(
    { success: true, data },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        'X-Response-Time': `${durationMs}ms`,
        'X-Cache-Lookup': 'in-memory-lru-singleflight',
      },
    }
  );
}
