import { ROUTES } from '@shirtify/core';
import { AppButton, AppText, AppSkeleton, AppEmptyState, DrawerService } from '@shirtify/ui';
import { Show } from '@shirtify/ui/flow';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { ENV } from '@shared/config/env.ts';

import { useArchiveSession } from '../api/use-archive-session.ts';
import { useSession } from '../api/use-session.ts';
import { SessionStatusPill } from '../helpers/session-status.tsx';
import { DesignResult } from './parts/design-result.tsx';
import { SessionInfo } from './parts/session-info.tsx';
import { CopyLink } from '../widgets/copy-link.tsx';

export default function SessionDetailScreen() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useSession(id);
  const archive = useArchiveSession();

  const onArchive = () => {
    DrawerService.confirm('Archive this session?', {
      description: 'It will be hidden from your main inbox. You can still find it under the Archived filter.',
      confirmLabel: 'Archive',
      onConfirm: async () => {
        await archive.mutateAsync(id);
        DrawerService.toast('Session archived', { tone: 'ink' });
        navigate(ROUTES.DASHBOARD);
      },
    });
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Link to={ROUTES.DASHBOARD} className="font-mono text-[11px] text-ink-3 hover:text-ink">
        ‹ Back to sessions
      </Link>

      <Show when={!isLoading} fallback={<DetailSkeleton />}>
        <Show
          when={!isError && data !== undefined}
          fallback={
            <AppEmptyState
              glyph="⚠"
              title="Session not found"
              description="This session may have been removed, or the link is wrong."
              className="mt-6"
            />
          }
        >
          {data ? (
            <>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <AppText variant="display-2">{data.session.customer_name ?? 'Unnamed'}</AppText>
                  <SessionStatusPill status={data.session.status} />
                </div>
                <Show when={data.session.status !== 'archived'}>
                  <AppButton variant="danger" size="sm" onClick={onArchive} loading={archive.isPending}>
                    Archive
                  </AppButton>
                </Show>
              </div>

              <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
                <div className="flex flex-col gap-5">
                  <div className="border-3 border-ink bg-paper-warm p-5 shadow-pop">
                    <AppText variant="overline">Customer link</AppText>
                    <AppText variant="body-sm" className="mb-3 mt-1">
                      Send this to your customer on WhatsApp.
                    </AppText>
                    <CopyLink url={`${ENV.WEB_BASE_URL}${ROUTES.CUSTOMER_DESIGN(data.session.token)}`} />
                  </div>
                  <SessionInfo session={data.session} />
                </div>

                <DesignResult detail={data} />
              </div>
            </>
          ) : null}
        </Show>
      </Show>
    </main>
  );
}

function DetailSkeleton() {
  return (
    <div className="mt-6 flex flex-col gap-5">
      <AppSkeleton className="h-10 w-72" />
      <div className="grid gap-6 lg:grid-cols-2">
        <AppSkeleton className="h-48" />
        <AppSkeleton className="h-48" />
      </div>
    </div>
  );
}
