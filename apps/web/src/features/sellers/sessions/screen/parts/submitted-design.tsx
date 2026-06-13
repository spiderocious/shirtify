import { type SessionDetailResponse } from '@shirtify/core';
import { AppText, AppToggle, DrawerService } from '@shirtify/ui';

import { toApiError } from '@shared/api/api-error.ts';

import { useSessionVisibility } from '../../api/use-session-visibility.ts';
import { ExportPanel } from './export-panel.tsx';
import { SubmittedPreview } from './submitted-preview.tsx';

/** Renders a submitted design (read-only) + storefront toggle + export controls. */
export function SubmittedDesign({ detail }: { detail: SessionDetailResponse }) {
  const visibility = useSessionVisibility();
  const isPublic = detail.session.visibility === 'public';

  const toggle = async (on: boolean) => {
    try {
      await visibility.mutateAsync({ id: detail.session.id, visibility: on ? 'public' : 'private' });
      DrawerService.toast(on ? 'Added to your storefront' : 'Removed from storefront', {
        tone: on ? 'go' : 'ink',
      });
    } catch (err) {
      DrawerService.toast((await toApiError(err)).message, { tone: 'warn' });
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <AppText variant="overline">Final design</AppText>
        <SubmittedPreview design={detail.design} className="mt-2" />
      </div>

      <div className="border-3 border-ink bg-paper-warm p-4 shadow-pop">
        <AppToggle
          label="Show on storefront"
          checked={isPublic}
          onChange={(on) => void toggle(on)}
        />
        <AppText variant="body-sm" className="mt-2">
          Featured designs appear on your public storefront for other customers to use.
        </AppText>
      </div>

      <ExportPanel sessionId={detail.session.id} />
    </div>
  );
}
