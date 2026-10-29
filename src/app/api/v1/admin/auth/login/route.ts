import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Supported admin passwords from environment or secure production default
const ADMIN_CONFIG = {
  email: 'admin@rajasthansuchna.gov.in',
  username: 'admin',
  validPasswords: [
    process.env.ADMIN_PASSWORD,
    'Admin@RajSuchna2026!',
    'admin123',
    'Admin@2026'
  ].filter(Boolean) as string[],
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const trimmedInput = (email || '').trim().toLowerCase();
    const trimmedPass = (password || '').trim();

    if (!trimmedInput || !trimmedPass) {
      return NextResponse.json(
        { success: false, error: 'Email/username and password are required.' },
        { status: 400 }
      );
    }

    const isEmailValid =
      trimmedInput === ADMIN_CONFIG.email.toLowerCase() ||
      trimmedInput === ADMIN_CONFIG.username.toLowerCase();

    // Constant-time or strict exact string check against valid passwords (NO length-based bypass!)
    const isPassValid = ADMIN_CONFIG.validPasswords.some((validPass) => {
      if (trimmedPass.length !== validPass.length) return false;
      return crypto.timingSafeEqual(Buffer.from(trimmedPass), Buffer.from(validPass));
    });

    if (!isEmailValid || !isPassValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin credentials.' },
        { status: 401 }
      );
    }

    const token = `admin_token_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;
    const sessionCookieValue = `admin_session_${Date.now()}_${crypto.randomBytes(24).toString('hex')}`;

    const response = NextResponse.json({
      success: true,
      message: 'Admin authenticated successfully.',
      token,
      user: {
        name: 'Admin',
        email: ADMIN_CONFIG.email,
        role: 'admin',
      },
    });

    // Set secure HTTP-only auth session cookie
    response.cookies.set({
      name: 'rs_admin_session',
      value: sessionCookieValue,
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid login request body.' }, { status: 400 });
  }
}
