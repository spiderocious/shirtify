import { type SessionDetailResponse } from '@shirtify/core';
import { AppEmptyState } from '@shirtify/ui';
import { Show } from '@shirtify/ui/flow';

import { SubmittedDesign } from './submitted-design.tsx';

/**
 * The design outcome panel on session detail. Shows a waiting state until the
 * customer submits, then the submitted design + export controls.
 */
export function DesignResult({ detail }: { detail: SessionDetailResponse }) {
  const submitted = detail.session.status === 'submitted';
  return (
    <Show
      when={submitted}
      fallback={
        <AppEmptyState
          glyph="⏳"
          title="Waiting on the customer"
          description="Once they submit their design, it'll show here — ready to download."
        />
      }
    >
      <SubmittedDesign detail={detail} />
    </Show>
  );
}
