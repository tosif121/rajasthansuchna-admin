import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { emailOrPhone, password } = body;

    const input = (emailOrPhone || '').trim().toLowerCase();
    const pass = (password || '').trim();

    if (!input || !pass) {
      return NextResponse.json(
        { success: false, error: 'Mobile / Email and Password are required.' },
        { status: 400 }
      );
    }

    // Default demo student credentials or any valid length student
    let studentName = 'अभ्यर्थी (Student)';
    if (input.includes('admin')) {
      studentName = 'प्रशासक (Admin)';
    } else if (input.includes('@')) {
      studentName = input.split('@')[0].toUpperCase();
    } else if (/^\d+$/.test(input)) {
      studentName = `Student (${input.slice(-4)})`;
    }

    const userId = `usr_${Date.now()}`;
    const user = {
      id: userId,
      name: studentName,
      email: input.includes('@') ? input : `${input}@student.rajasthansuchna.in`,
      phone: /^\d+$/.test(input) ? input : undefined,
      targetExam: 'CET & Rajasthan Police',
      role: 'student',
      isLoggedIn: true,
    };

    const token = `rs_jwt_${userId}_${Buffer.from(input).toString('base64')}`;

    return NextResponse.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid login payload.' },
      { status: 400 }
    );
  }
}
