import { ROUTES } from '@shirtify/core';
import { lazy } from 'react';
import { Outlet, Route } from 'react-router-dom';

import { AuthGuard } from './auth/guards/auth-guard.tsx';
import { GuestOnly } from './auth/guards/guest-only.tsx';
import { AuthProvider } from './auth/providers/auth-provider.tsx';

const LoginScreen = lazy(() => import('./auth/screen/login-screen.tsx'));
const RegisterScreen = lazy(() => import('./auth/screen/register-screen.tsx'));
const DashboardLayout = lazy(() => import('./dashboard/screen/dashboard-layout.tsx'));
const SessionsInboxScreen = lazy(() => import('./sessions/screen/sessions-inbox-screen.tsx'));
const NewSessionScreen = lazy(() => import('./sessions/screen/new-session-screen.tsx'));
const SessionDetailScreen = lazy(() => import('./sessions/screen/session-detail-screen.tsx'));

/** Scopes the seller auth context to the seller routes only (not customer pages). */
function SellerAuthLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

/**
 * The seller route subtree, owned by the sellers feature. Called as a function
 * inside <Routes> so the <Route>s are direct children (react-router v6 requires
 * Route elements, not wrapper components).
 */
export function SellerRoutes() {
  return (
    <Route element={<SellerAuthLayout />}>
      <Route
        path={ROUTES.LOGIN}
        element={
          <GuestOnly>
            <LoginScreen />
          </GuestOnly>
        }
      />
      <Route
        path={ROUTES.REGISTER}
        element={
          <GuestOnly>
            <RegisterScreen />
          </GuestOnly>
        }
      />
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <AuthGuard>
            <DashboardLayout />
          </AuthGuard>
        }
      >
        <Route index element={<SessionsInboxScreen />} />
        <Route path="new" element={<NewSessionScreen />} />
        <Route path="sessions/:id" element={<SessionDetailScreen />} />
      </Route>
    </Route>
  );
}
