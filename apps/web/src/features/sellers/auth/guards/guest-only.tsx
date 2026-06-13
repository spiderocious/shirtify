import { ROUTES } from '@shirtify/core';
import { Show } from '@shirtify/ui/flow';
import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../providers/auth-provider.tsx';

/** Keeps already-authenticated sellers out of the login/register screens. */
export function GuestOnly({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  // While validating an existing token, render nothing (avoids a flash).
  if (isLoading) return null;
  return (
    <Show when={!isAuthenticated} fallback={<Navigate to={ROUTES.DASHBOARD} replace />}>
      {children}
    </Show>
  );
}
