import { ROUTES } from '@shirtify/core';
import { AppButton, AppText, AppAvatar } from '@shirtify/ui';
import { Show } from '@shirtify/ui/flow';
import { useNavigate, Link, NavLink } from 'react-router-dom';

import { useLogout } from '@features/sellers/auth/api/use-logout.ts';
import { useAuth } from '@features/sellers/auth/providers/auth-provider.tsx';
import { ENV } from '@shared/config/env.ts';

const initials = (name: string): string =>
  name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'S';

function HeaderLink({ to, end, children }: { to: string; end?: boolean; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `border-2.5 px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.04em] ${
          isActive ? 'border-ink bg-lime text-lime-ink' : 'border-transparent text-ink-2 hover:text-ink'
        }`
      }
    >
      {children}
    </NavLink>
  );
}

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
        <div className="flex items-center gap-5">
          <Link to={ROUTES.DASHBOARD} className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center border-2.5 border-ink bg-lime font-display text-sm text-lime-ink">
              S
            </span>
            <AppText variant="heading" as="span">
              Shirtify
            </AppText>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <HeaderLink to={ROUTES.DASHBOARD} end>
              Dashboard
            </HeaderLink>
            <HeaderLink to={ROUTES.DASHBOARD_SESSIONS}>Sessions</HeaderLink>
            <HeaderLink to={ROUTES.STOREFRONT_MGMT}>Storefront</HeaderLink>
            <HeaderLink to={ROUTES.BRAND}>Brand</HeaderLink>
          </nav>
        </div>

        <Show when={seller !== null}>
          <div className="flex items-center gap-3">
            <AppButton
              variant="secondary"
              size="sm"
              onClick={() =>
                window.open(
                  `${ENV.WEB_BASE_URL}${ROUTES.STOREFRONT(seller?.public_slug ?? '')}`,
                  '_blank',
                  'noopener',
                )
              }
            >
              Open storefront ↗
            </AppButton>
            <AppAvatar initials={initials(seller?.business_name ?? 'S')} tone="lime" size="md" />
            <AppButton variant="ghost" size="sm" onClick={onLogout} loading={logout.isPending}>
              Log out
            </AppButton>
          </div>
        </Show>
      </div>
    </header>
  );
}
