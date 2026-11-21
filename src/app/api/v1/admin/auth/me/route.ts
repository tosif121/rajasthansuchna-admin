import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AuthError } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        name: 'Admin',
        email: admin.email || 'admin@rajasthansuchna.gov.in',
        role: 'admin',
      },
    });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, authenticated: false }, { status: 401 });
  }
}
