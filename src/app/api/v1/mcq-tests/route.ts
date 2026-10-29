import { connection, NextResponse } from 'next/server';
import { McqService } from '@/server/services/mcq-service';

export async function GET() {
  await connection();
  const data = await McqService.getAllTests(false);
  return NextResponse.json(
    { success: true, data },
    { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } }
  );
}
