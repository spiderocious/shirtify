import { type SessionStatus } from '@shirtify/core';
import { AppPill, type AppPillTone } from '@shirtify/ui';

const STATUS_META: Record<SessionStatus, { tone: AppPillTone; label: string }> = {
  in_progress: { tone: 'default', label: 'In progress' },
  submitted: { tone: 'go', label: 'Submitted' },
  archived: { tone: 'ink', label: 'Archived' },
};

/** A status badge for a session. Status colour always carries a word. */
export function SessionStatusPill({ status }: { status: SessionStatus }) {
  const meta = STATUS_META[status];
  return (
    <AppPill tone={meta.tone} dot={status === 'submitted'}>
      {meta.label}
    </AppPill>
  );
}
