import { NextRequest, NextResponse } from 'next/server';
import { sql, isNeonReachable, safeNeonQuery } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export interface CreditRequestItem {
  id: string;
  userId: string;
  candidateName: string;
  phone?: string;
  email?: string;
  amount: number;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

const requestsFilePath = path.join(process.cwd(), 'src', 'data', 'credit_requests.json');

export function getFallbackCreditRequests(): CreditRequestItem[] {
  try {
    if (fs.existsSync(requestsFilePath)) {
      return JSON.parse(fs.readFileSync(requestsFilePath, 'utf8'));
    }
  } catch {}
  return [];
}

export function saveFallbackCreditRequests(requests: CreditRequestItem[]) {
  try {
    const dir = path.dirname(requestsFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(requestsFilePath, JSON.stringify(requests, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save credit_requests.json:', err);
  }
}

async function ensureCreditRequestsTable() {
  if (!sql || !(await isNeonReachable(sql))) return;
  try {
    await safeNeonQuery(sql`
      CREATE TABLE IF NOT EXISTS credit_requests (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        candidate_name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        amount INT NOT NULL DEFAULT 10,
        reason TEXT,
        status TEXT NOT NULL DEFAULT 'PENDING',
        created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
        reviewed_at TIMESTAMPTZ,
        reviewed_by TEXT
      );
    `);
  } catch (err) {
    console.warn('Could not initialize credit_requests table:', err);
  }
}

// POST: Candidate submits a credit request from the app
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, candidateName, name, phone, email, amount, reason } = body;

    const resolvedUserId = (userId || '').toString().trim() || `usr_guest_${Date.now()}`;
    const resolvedName = (candidateName || name || '').toString().trim() || 'Candidate';
    const cleanPhone = (phone || '').toString().replace(/\D/g, '').slice(-10);
    const parsedAmount = Math.max(1, Math.min(100, parseInt(amount, 10) || 10));
    const nowIso = new Date().toISOString();
    const requestId = `cr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newRequest: CreditRequestItem = {
      id: requestId,
      userId: resolvedUserId,
      candidateName: resolvedName,
      phone: cleanPhone || phone || undefined,
      email: email ? email.toString().trim() : undefined,
      amount: parsedAmount,
      reason: (reason || 'AI Assistant Recharge').toString().trim().slice(0, 100),
      status: 'PENDING',
      createdAt: nowIso,
    };

    if (sql && (await isNeonReachable(sql))) {
      try {
        await ensureCreditRequestsTable();
        await safeNeonQuery(sql`
          INSERT INTO credit_requests (id, user_id, candidate_name, phone, email, amount, reason, status, created_at)
          VALUES (
            ${newRequest.id},
            ${newRequest.userId},
            ${newRequest.candidateName},
            ${newRequest.phone || null},
            ${newRequest.email || null},
            ${newRequest.amount},
            ${newRequest.reason || null},
            'PENDING',
            NOW()
          );
        `);
      } catch (dbErr) {
        console.warn('Could not insert credit request into Neon DB:', dbErr);
      }
    }

    const fallbackList = getFallbackCreditRequests();
    fallbackList.unshift(newRequest);
    saveFallbackCreditRequests(fallbackList);

    return NextResponse.json({
      success: true,
      message: `Credit request for +${parsedAmount} credits submitted successfully. Admin will review and approve shortly.`,
      request: newRequest,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to submit credit request.' },
      { status: 500 }
    );
  }
}

// GET: Query status of credit requests for a candidate
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const phone = searchParams.get('phone')?.replace(/\D/g, '').slice(-10);

    let requests: CreditRequestItem[] = [];

    if (sql && (await isNeonReachable(sql))) {
      try {
        await ensureCreditRequestsTable();
        const rows = (await safeNeonQuery(sql`
          SELECT 
            id,
            user_id as "userId",
            candidate_name as "candidateName",
            phone,
            email,
            amount,
            reason,
            status,
            created_at as "createdAt",
            reviewed_at as "reviewedAt",
            reviewed_by as "reviewedBy"
          FROM credit_requests
          WHERE (${userId || null}::text IS NOT NULL AND user_id = ${userId || null})
             OR (${phone || null}::text IS NOT NULL AND RIGHT(phone, 10) = ${phone || null})
          ORDER BY created_at DESC
          LIMIT 10;
        `)) as any[];

        if (rows && rows.length > 0) {
          requests = rows;
        }
      } catch {}
    }

    if (requests.length === 0) {
      requests = getFallbackCreditRequests().filter((r) =>
        (userId && r.userId === userId) ||
        (phone && r.phone && r.phone.replace(/\D/g, '').slice(-10) === phone)
      );
    }

    return NextResponse.json({
      success: true,
      requests,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch credit requests.' },
      { status: 500 }
    );
  }
}
