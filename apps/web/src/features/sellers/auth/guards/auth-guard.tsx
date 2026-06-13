import { ROUTES } from '@shirtify/core';
import { AppSkeleton } from '@shirtify/ui';
import { Show } from '@shirtify/ui/flow';
import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../providers/auth-provider.tsx';

/** Gates dashboard routes: shows a skeleton while validating, redirects to login. */
export function AuthGuard({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-12">
        <AppSkeleton className="h-10 w-64" />
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <AppSkeleton className="h-24" />
          <AppSkeleton className="h-24" />
          <AppSkeleton className="h-24" />
        </div>
      </div>
    );
  }

  return (
    <Show when={isAuthenticated} fallback={<Navigate to={ROUTES.LOGIN} replace />}>
      {children}
    </Show>
  );
}
