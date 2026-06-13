import { ROUTES } from '@shirtify/core';
import { AppText, AppStat, AppButton, AppSkeleton } from '@shirtify/ui';
import { Show } from '@shirtify/ui/flow';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@features/sellers/auth/providers/auth-provider.tsx';
import { useSessions } from '@features/sellers/sessions/api/use-sessions.ts';

/** Default dashboard tab — a quick overview + jump-offs. */
export default function OverviewScreen() {
  const navigate = useNavigate();
  const { seller } = useAuth();
  const all = useSessions({});
  const submitted = useSessions({ status: 'submitted' });

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <AppText variant="overline">Dashboard</AppText>
      <AppText variant="display-2" className="mt-1">
        Welcome back{seller ? `, ${seller.business_name}` : ''}
      </AppText>

      <Show when={!all.isLoading} fallback={<AppSkeleton className="mt-8 h-24" />}>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <AppStat label="Sessions" value={all.data?.items.length ?? 0} />
          <AppStat label="Submitted" value={submitted.data?.items.length ?? 0} tone="lime" />
          <AppStat label="On storefront" value="—" mono />
        </div>
      </Show>

      <div className="mt-8 flex flex-wrap gap-3">
        <AppButton variant="primary" onClick={() => navigate(`${ROUTES.DASHBOARD}/new`)}>
          + New session
        </AppButton>
        <AppButton variant="secondary" onClick={() => navigate(ROUTES.DASHBOARD_SESSIONS)}>
          View sessions
        </AppButton>
        <AppButton variant="secondary" onClick={() => navigate(ROUTES.STOREFRONT_MGMT)}>
          Manage storefront
        </AppButton>
      </div>
    </main>
  );
}
