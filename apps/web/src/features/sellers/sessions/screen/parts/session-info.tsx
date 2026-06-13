import { SHIRT_TYPE_LABELS, formatRelative, type Session } from '@shirtify/core';
import { AppText } from '@shirtify/ui';
import { Show } from '@shirtify/ui/flow';

import { EditShirtButton } from './edit-shirt.tsx';

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b-2.5 border-ink/15 py-2.5 last:border-b-0">
      <AppText variant="overline">{label}</AppText>
      <span className="text-right font-sans text-sm font-bold text-ink">{children}</span>
    </div>
  );
}

const naira = (kobo: number): string => `₦${(kobo / 100).toLocaleString('en-NG')}`;

export function SessionInfo({ session }: { session: Session }) {
  return (
    <div className="border-3 border-ink bg-paper-warm p-5 shadow-pop">
      <div className="flex items-center justify-between">
        <AppText variant="overline">Session details</AppText>
        <Show when={session.status !== 'archived'}>
          <EditShirtButton session={session} />
        </Show>
      </div>
      <div className="mt-3">
        <Row label="Shirt">
          {SHIRT_TYPE_LABELS[session.shirt_type]} · {session.shirt_color}
        </Row>
        <Show when={session.material_slug !== null}>
          <Row label="Material">{session.material_slug}</Row>
        </Show>
        <Show when={session.price_quoted !== null}>
          <Row label="Price quoted">{naira(session.price_quoted ?? 0)}</Row>
        </Show>
        <Row label="Source">{session.kind === 'public' ? 'Storefront walk-in' : 'Custom link'}</Row>
        <Row label="Created">{formatRelative(session.created_at)}</Row>
        <Row label="Last activity">{formatRelative(session.last_activity_at)}</Row>
        <Show when={session.notes !== null}>
          <div className="pt-3">
            <AppText variant="overline">Your notes</AppText>
            <AppText variant="body-sm" className="mt-1">
              {session.notes}
            </AppText>
          </div>
        </Show>
      </div>
    </div>
  );
}
