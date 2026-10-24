import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, error: 'Missing or invalid Authorization header.' },
      { status: 401 }
    );
  }

  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized.' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    user: {
      id: 'usr_me',
      name: 'सत्यापित अभ्यर्थी',
      email: 'student@rajasthansuchna.in',
      targetExam: 'CET / Rajasthan Police / REET',
      isLoggedIn: true,
    },
  });
}
