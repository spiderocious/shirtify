import { ROUTES, SHIRT_TYPE_LABELS, formatRelative, type Session } from '@shirtify/core';
import { AppText, AppCard } from '@shirtify/ui';
import { Repeat } from '@shirtify/ui/flow';
import { useNavigate } from 'react-router-dom';

import { SessionStatusPill } from '../../helpers/session-status.tsx';

/** Mobile presentation of the sessions inbox — one tappable card per session. */
export function SessionsCards({ rows }: { rows: readonly Session[] }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-3">
      <Repeat each={[...rows]}>
        {(s) => (
          <AppCard
            key={s.id}
            pressable
            onClick={() => navigate(ROUTES.SESSION_DETAIL(s.id))}
            className="p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <AppText variant="heading" as="span" className="block truncate">
                  {s.customer_name ?? 'Unnamed'}
                </AppText>
                <AppText variant="mono" as="span" className="block text-[10px]">
                  /c/{s.token}
                </AppText>
              </div>
              <SessionStatusPill status={s.status} />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <AppText variant="body-sm" as="span" className="!text-ink">
                {SHIRT_TYPE_LABELS[s.shirt_type]} · {s.shirt_color}
              </AppText>
              <AppText variant="mono" as="span" className="text-[10px]">
                {s.kind === 'public' ? 'storefront' : 'link'} · {formatRelative(s.last_activity_at)}
              </AppText>
            </div>
          </AppCard>
        )}
      </Repeat>
    </div>
  );
}
