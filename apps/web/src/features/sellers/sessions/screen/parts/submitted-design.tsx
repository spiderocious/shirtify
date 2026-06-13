import { type SessionDetailResponse } from '@shirtify/core';
import { AppText } from '@shirtify/ui';

import { ExportPanel } from './export-panel.tsx';
import { SubmittedPreview } from './submitted-preview.tsx';

/** Renders a submitted design (read-only) + the export/download controls. */
export function SubmittedDesign({ detail }: { detail: SessionDetailResponse }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <AppText variant="overline">Final design</AppText>
        <SubmittedPreview design={detail.design} className="mt-2" />
      </div>
      <ExportPanel sessionId={detail.session.id} />
    </div>
  );
}
