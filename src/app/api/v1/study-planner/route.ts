import { NextRequest, NextResponse } from 'next/server';
import { PrepService } from '@/server/services/prep-service';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || undefined;
  const agencyId = searchParams.get('agencyId') || undefined;

  const list = await PrepService.getStudyPlans(q, agencyId);
  return NextResponse.json(
    { success: true, count: list.length, data: list.filter((sp) => sp.isActive) },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    }
  );
}
