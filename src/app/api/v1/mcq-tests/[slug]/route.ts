import { connection, NextRequest, NextResponse } from 'next/server';
import { McqService } from '@/server/services/mcq-service';

export async function GET(_req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await context.params;
  const test = await McqService.getTest(slug);
  if (!test || !test.isActive) {
    return NextResponse.json({ success: false, error: 'MCQ test not found' }, { status: 404 });
  }
  return NextResponse.json(
    { success: true, data: test },
    { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } }
  );
}
