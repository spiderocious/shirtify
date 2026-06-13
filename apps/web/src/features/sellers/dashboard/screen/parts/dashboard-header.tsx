import { ROUTES } from '@shirtify/core';
import { AppButton, AppText, AppAvatar } from '@shirtify/ui';
import { Show } from '@shirtify/ui/flow';
import { useNavigate, Link } from 'react-router-dom';

import { useLogout } from '@features/sellers/auth/api/use-logout.ts';
import { useAuth } from '@features/sellers/auth/providers/auth-provider.tsx';

const initials = (name: string): string =>
  name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'S';

export function DashboardHeader() {
  const { seller } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout.mutateAsync();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <header className="border-b-3 border-ink bg-paper-warm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3.5">
        <Link to={ROUTES.DASHBOARD} className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center border-2.5 border-ink bg-lime font-display text-sm text-lime-ink">
            S
          </span>
          <AppText variant="heading" as="span">
            Shirtify
          </AppText>
        </Link>

        <Show when={seller !== null}>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <AppText variant="body-sm" className="font-bold !text-ink">
                {seller?.business_name}
              </AppText>
              <AppText variant="mono" as="span" className="block text-[10px]">
                /s/{seller?.public_slug}
              </AppText>
            </div>
            <AppAvatar initials={initials(seller?.business_name ?? 'S')} tone="lime" size="md" />
            <AppButton
              variant="ghost"
              size="sm"
              onClick={onLogout}
              loading={logout.isPending}
            >
              Log out
            </AppButton>
          </div>
        </Show>
      </div>
    </header>
  );
}
