import { ROUTES } from '@shirtify/core';
import { Show } from '@shirtify/ui/flow';
import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../providers/auth-provider.tsx';

/**
 * Forces a freshly-registered seller through the (unskippable) store-setup page
 * before they can reach the dashboard. Use INSIDE AuthGuard.
 */
export function RegistrationGuard({ children }: { children: ReactNode }) {
  const { needsBusinessSetup } = useAuth();
  return (
    <Show when={!needsBusinessSetup} fallback={<Navigate to={ROUTES.SETUP} replace />}>
      {children}
    </Show>
  );
}

/** The inverse: keeps a fully-onboarded seller OUT of the setup page. */
export function SetupOnly({ children }: { children: ReactNode }) {
  const { needsBusinessSetup } = useAuth();
  return (
    <Show when={needsBusinessSetup} fallback={<Navigate to={ROUTES.DASHBOARD} replace />}>
      {children}
    </Show>
  );
}
