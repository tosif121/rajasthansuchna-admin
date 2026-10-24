import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const session = req.cookies.get('rs_admin_session');
  if (!session || !session.value) {
    return NextResponse.json({ success: false, authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    authenticated: true,
    user: {
      name: 'Admin',
      email: 'admin@rajasthansuchna.gov.in',
      role: 'admin'
    }
  });
}
