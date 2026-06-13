import { ROUTES } from '@shirtify/core';
import { AppButton, AppText, AppEmptyState, AppSkeleton } from '@shirtify/ui';
import { Show } from '@shirtify/ui/flow';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useSessions } from '../api/use-sessions.ts';
import { InboxToolbar, type Filter } from './parts/inbox-toolbar.tsx';
import { SessionsTable } from './parts/sessions-table.tsx';

export default function SessionsInboxScreen() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('all');
  // A stack of cursors: [] = page 1; pushing a nextCursor advances a page.
  const [cursors, setCursors] = useState<string[]>([]);
  const currentCursor = cursors.at(-1);

  const { data, isLoading, isError, refetch } = useSessions({
    ...(currentCursor !== undefined && { cursor: currentCursor }),
    ...(filter !== 'all' && { status: filter }),
  });

  const changeFilter = (next: Filter) => {
    setFilter(next);
    setCursors([]);
  };

  const goNext = () => {
    if (data?.nextCursor) setCursors((c) => [...c, data.nextCursor as string]);
  };
  const goPrev = () => setCursors((c) => c.slice(0, -1));

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <AppText variant="overline">Dashboard</AppText>
          <AppText variant="display-2" className="mt-1">
            Customer sessions
          </AppText>
        </div>
        <AppButton variant="primary" onClick={() => navigate(ROUTES.DASHBOARD + '/new')}>
          + New session
        </AppButton>
      </div>

      <div className="mt-6">
        <InboxToolbar active={filter} onChange={changeFilter} />
      </div>

      <div className="mt-5">
        <Show when={!isLoading} fallback={<InboxSkeleton />}>
          <Show
            when={!isError}
            fallback={
              <AppEmptyState
                glyph="⚠"
                title="Couldn't load sessions"
                description="Check your connection and try again."
                action={
                  <AppButton variant="secondary" onClick={() => void refetch()}>
                    Retry
                  </AppButton>
                }
              />
            }
          >
            <Show
              when={(data?.items.length ?? 0) > 0}
              fallback={
                <AppEmptyState
                  glyph="✚"
                  title="No sessions yet"
                  description="Create a session to generate a design link you can send to a customer on WhatsApp."
                  action={
                    <AppButton variant="primary" onClick={() => navigate(ROUTES.DASHBOARD + '/new')}>
                      New session
                    </AppButton>
                  }
                />
              }
            >
              <SessionsTable rows={data?.items ?? []} />
              <div className="mt-4 flex items-center justify-between">
                <AppButton
                  variant="secondary"
                  size="sm"
                  disabled={cursors.length === 0}
                  onClick={goPrev}
                >
                  ‹ Previous
                </AppButton>
                <AppButton
                  variant="secondary"
                  size="sm"
                  disabled={!data?.hasMore}
                  onClick={goNext}
                >
                  Next ›
                </AppButton>
              </div>
            </Show>
          </Show>
        </Show>
      </div>
    </main>
  );
}

function InboxSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <AppSkeleton className="h-12" />
      <AppSkeleton className="h-12" />
      <AppSkeleton className="h-12" />
    </div>
  );
}
