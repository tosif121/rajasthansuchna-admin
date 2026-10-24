import { NextRequest, NextResponse } from 'next/server';

interface StudentUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  targetExam?: string;
  createdAt: string;
}

// In-memory store for registered mobile students (mirrored)
const registeredUsers: Map<string, StudentUser & { passwordHash: string }> = new Map();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, password, targetExam } = body;

    const trimmedName = (name || '').trim();
    const trimmedEmail = (email || '').trim().toLowerCase();
    const trimmedPhone = (phone || '').trim();
    const trimmedPass = (password || '').trim();

    if (!trimmedName || !trimmedEmail || !trimmedPass) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    if (trimmedPass.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    if (registeredUsers.has(trimmedEmail)) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    const userId = `usr_${Date.now()}`;
    const user: StudentUser = {
      id: userId,
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone || undefined,
      targetExam: targetExam || 'CET / Police',
      createdAt: new Date().toISOString(),
    };

    registeredUsers.set(trimmedEmail, { ...user, passwordHash: trimmedPass });

    const token = `rs_token_${userId}_${Date.now()}`;

    return NextResponse.json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid registration payload.' },
      { status: 400 }
    );
  }
}
