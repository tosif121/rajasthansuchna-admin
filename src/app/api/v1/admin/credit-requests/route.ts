import { NextRequest, NextResponse } from 'next/server';
import { sql, isNeonReachable, safeNeonQuery } from '@/lib/db';
import { requireAdmin, AuthError } from '@/lib/auth';
import { AuditService } from '@/server/services/audit-service';
import fs from 'fs';
import path from 'path';
import { CreditRequestItem, getFallbackCreditRequests, saveFallbackCreditRequests } from '../../credits/request/route';

const usersFilePath = path.join(process.cwd(), 'src', 'data', 'users.json');

function getFallbackUsers(): any[] {
  try {
    if (fs.existsSync(usersFilePath)) {
      return JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
    }
  } catch {}
  return [];
}

function saveFallbackUsers(users: any[]) {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
  } catch {}
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    let requests: CreditRequestItem[] = [];

    if (sql && (await isNeonReachable(sql))) {
      try {
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
          ORDER BY 
            CASE WHEN status = 'PENDING' THEN 0 ELSE 1 END,
            created_at DESC
          LIMIT 200;
        `)) as any[];

        if (rows && rows.length > 0) {
          requests = rows;
        }
      } catch (err) {
        console.warn('DB credit_requests query failed, falling back to JSON:', err);
      }
    }

    if (requests.length === 0) {
      requests = getFallbackCreditRequests().sort((a, b) => {
        if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
        if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    const pendingCount = requests.filter((r) => r.status === 'PENDING').length;

    return NextResponse.json({
      success: true,
      data: {
        requests,
        pendingCount,
        total: requests.length,
      },
    });
  } catch (error: unknown) {
    if (error instanceof AuthError || (error as any)?.statusCode === 401) {
      return NextResponse.json({ success: false, error: (error as Error).message }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to fetch credit requests.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    const body = await req.json();
    const { id, action } = body; // action: 'APPROVE' | 'REJECT'

    if (!id || !action || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Valid Request ID and action (APPROVE/REJECT) are required.' },
        { status: 400 }
      );
    }

    const nowIso = new Date().toISOString();
    const reviewerName = admin.email || 'Admin';

    // 1. Fetch current request
    const fallbackList = getFallbackCreditRequests();
    const reqIndex = fallbackList.findIndex((r) => r.id === id);
    let targetRequest = reqIndex >= 0 ? fallbackList[reqIndex] : null;

    if (sql && (await isNeonReachable(sql))) {
      try {
        const rows = (await safeNeonQuery(sql`
          SELECT 
            id,
            user_id as "userId",
            candidate_name as "candidateName",
            phone,
            email,
            amount,
            status
          FROM credit_requests
          WHERE id = ${id}
          LIMIT 1;
        `)) as any[];

        if (rows && rows.length > 0) {
          targetRequest = rows[0];
        }
      } catch {}
    }

    if (!targetRequest) {
      return NextResponse.json({ success: false, error: 'Credit request not found.' }, { status: 404 });
    }

    if (targetRequest.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: `This request is already ${targetRequest.status.toLowerCase()}.` },
        { status: 400 }
      );
    }

    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    const cleanPhone = (targetRequest.phone || '').replace(/\D/g, '').slice(-10);

    // 2. If APPROVED, grant credits to user in DB and JSON
    if (action === 'APPROVE') {
      const grantAmount = targetRequest.amount || 10;

      if (sql && (await isNeonReachable(sql))) {
        try {
          await safeNeonQuery(sql`
            ALTER TABLE app_users ADD COLUMN IF NOT EXISTS credits INT DEFAULT 10 NOT NULL;
            UPDATE app_users
            SET credits = COALESCE(credits, 10) + ${grantAmount},
                last_active_at = NOW()
            WHERE id = ${targetRequest.userId}
               OR (${cleanPhone || ''}::text != '' AND RIGHT(phone, 10) = ${cleanPhone || ''})
               OR (${targetRequest.email || ''}::text != '' AND LOWER(email) = LOWER(${targetRequest.email || ''}));
          `);
        } catch (dbErr) {
          console.warn('Failed to update app_users credits in DB:', dbErr);
        }
      }

      const users = getFallbackUsers();
      const user = users.find(
        (u) =>
          u.id === targetRequest.userId ||
          (cleanPhone && u.phone && u.phone.replace(/\D/g, '').slice(-10) === cleanPhone) ||
          (targetRequest.email && u.email && u.email.toLowerCase() === targetRequest.email.toLowerCase())
      );
      if (user) {
        user.credits = (user.credits ?? 10) + grantAmount;
        user.lastActiveAt = nowIso;
        saveFallbackUsers(users);
      }
    }

    // 3. Update credit request status
    if (sql && (await isNeonReachable(sql))) {
      try {
        await safeNeonQuery(sql`
          UPDATE credit_requests
          SET status = ${newStatus},
              reviewed_at = NOW(),
              reviewed_by = ${reviewerName}
          WHERE id = ${id};
        `);
      } catch {}
    }

    if (reqIndex >= 0) {
      fallbackList[reqIndex].status = newStatus;
      fallbackList[reqIndex].reviewedAt = nowIso;
      fallbackList[reqIndex].reviewedBy = reviewerName;
      saveFallbackCreditRequests(fallbackList);
    }

    await AuditService.recordLog({
      action: `${action === 'APPROVE' ? 'Approved' : 'Rejected'} credit request (+${targetRequest.amount}) for ${targetRequest.candidateName}`,
      actorName: reviewerName,
      actorRole: 'Administrator',
      entityType: 'Credit Request',
      entityName: targetRequest.candidateName,
      ipAddress: '127.0.0.1',
      status: 'SUCCESS',
    });

    return NextResponse.json({
      success: true,
      message: action === 'APPROVE'
        ? `Approved request! Granted +${targetRequest.amount} AI credits to ${targetRequest.candidateName}.`
        : `Rejected credit request from ${targetRequest.candidateName}.`,
      status: newStatus,
    });
  } catch (error: unknown) {
    if (error instanceof AuthError || (error as any)?.statusCode === 401) {
      return NextResponse.json({ success: false, error: (error as Error).message }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to process credit request.' }, { status: 500 });
  }
}
