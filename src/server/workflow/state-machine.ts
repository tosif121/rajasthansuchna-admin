export type WorkflowStatus = 'draft' | 'in_review' | 'approved' | 'published' | 'archived' | 'rejected';

export interface WorkflowTransitionContext {
  noticeId: string;
  revisionId?: string;
  currentStatus: WorkflowStatus;
  actorId?: string;
  actorRole?: string;
  editorId?: string;
  reason?: string;
}

export interface TransitionResult {
  allowed: boolean;
  nextStatus?: WorkflowStatus;
  error?: string;
}

export class WorkflowStateMachine {
  /**
   * Evaluates if a status transition is permitted. Admin has universal editorial authority.
   */
  static evaluate(context: WorkflowTransitionContext, targetAction: 'submit' | 'request_changes' | 'approve' | 'publish' | 'archive'): TransitionResult {
    const { currentStatus, reason } = context;

    switch (targetAction) {
      case 'submit': {
        if (currentStatus !== 'draft' && currentStatus !== 'rejected') {
          return { allowed: false, error: `Cannot submit notice for review from status "${currentStatus}".` };
        }
        return { allowed: true, nextStatus: 'in_review' };
      }

      case 'request_changes': {
        if (currentStatus !== 'in_review') {
          return { allowed: false, error: `Can only request changes on notices currently "in_review".` };
        }
        if (!reason || reason.trim().length === 0) {
          return { allowed: false, error: 'Reason is required when requesting changes.' };
        }
        return { allowed: true, nextStatus: 'draft' };
      }

      case 'approve': {
        if (currentStatus !== 'in_review') {
          return { allowed: false, error: `Cannot approve notice with status "${currentStatus}". Must be "in_review".` };
        }
        return { allowed: true, nextStatus: 'approved' };
      }

      case 'publish': {
        if (currentStatus !== 'approved') {
          return { allowed: false, error: `Only approved notices can be published. Current status is "${currentStatus}".` };
        }
        return { allowed: true, nextStatus: 'published' };
      }

      case 'archive': {
        if (currentStatus !== 'published') {
          return { allowed: false, error: `Only published notices can be archived.` };
        }
        return { allowed: true, nextStatus: 'archived' };
      }

      default:
        return { allowed: false, error: `Unknown workflow action: ${targetAction}` };
    }
  }
}
