import { NextRequest, NextResponse } from 'next/server';
import { NoticeService, NoticeStatus } from '@/server/services/notice-service';
import { invalidateNoticeCache } from '@/server/cache';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ids, status, updates } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No notice IDs provided for bulk operation.' },
        { status: 400 }
      );
    }

    if (action === 'status') {
      if (!status || (status !== 'active' && status !== 'inactive')) {
        return NextResponse.json(
          { success: false, error: 'Invalid status for bulk status update.' },
          { status: 400 }
        );
      }
      const result = await NoticeService.bulkUpdateStatus(ids, status as NoticeStatus);
      invalidateNoticeCache();
      return NextResponse.json({
        success: true,
        updatedCount: result.updatedCount,
        message: `Successfully updated ${result.updatedCount} notices to ${status}.`
      });
    }

    if (action === 'delete') {
      const result = await NoticeService.bulkDelete(ids);
      invalidateNoticeCache();
      return NextResponse.json({
        success: true,
        deletedCount: result.deletedCount,
        message: `Successfully deleted ${result.deletedCount} notices.`
      });
    }

    if (action === 'edit') {
      if (!updates || typeof updates !== 'object') {
        return NextResponse.json(
          { success: false, error: 'No update fields provided for bulk edit.' },
          { status: 400 }
        );
      }
      const result = await NoticeService.bulkEdit(ids, updates);
      invalidateNoticeCache();
      return NextResponse.json({
        success: true,
        updatedCount: result.updatedCount,
        message: `Successfully bulk updated ${result.updatedCount} notices.`
      });
    }

    return NextResponse.json(
      { success: false, error: `Unsupported bulk action: ${action}` },
      { status: 400 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error during bulk operation';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
