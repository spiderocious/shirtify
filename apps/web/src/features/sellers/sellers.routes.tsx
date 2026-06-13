import { ROUTES } from '@shirtify/core';
import { lazy } from 'react';
import { Outlet, Route } from 'react-router-dom';

import { AuthGuard } from './auth/guards/auth-guard.tsx';
import { GuestOnly } from './auth/guards/guest-only.tsx';
import { RegistrationGuard, SetupOnly } from './auth/guards/registration-guard.tsx';
import { AuthProvider } from './auth/providers/auth-provider.tsx';

const LoginScreen = lazy(() => import('./auth/screen/login-screen.tsx'));
const RegisterScreen = lazy(() => import('./auth/screen/register-screen.tsx'));
const SetupScreen = lazy(() => import('./auth/screen/setup-screen.tsx'));
const DashboardLayout = lazy(() => import('./dashboard/screen/dashboard-layout.tsx'));
const OverviewScreen = lazy(() => import('./dashboard/screen/overview-screen.tsx'));
const SessionsInboxScreen = lazy(() => import('./sessions/screen/sessions-inbox-screen.tsx'));
const NewSessionScreen = lazy(() => import('./sessions/screen/new-session-screen.tsx'));
const SessionDetailScreen = lazy(() => import('./sessions/screen/session-detail-screen.tsx'));
const StorefrontMgmtScreen = lazy(
  () => import('./storefront-mgmt/screen/storefront-mgmt-screen.tsx'),
);
const BrandScreen = lazy(() => import('./brand/screen/brand-screen.tsx'));

function SellerAuthLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

/**
 * The seller route subtree. Called as a function inside <Routes>. Auth is scoped
 * here; a freshly-registered seller is forced through /setup (RegistrationGuard)
 * before the dashboard tabs become reachable.
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
        path={ROUTES.SETUP}
        element={
          <AuthGuard>
            <SetupOnly>
              <SetupScreen />
            </SetupOnly>
          </AuthGuard>
        }
      />

      <Route
        path={ROUTES.DASHBOARD}
        element={
          <AuthGuard>
            <RegistrationGuard>
              <DashboardLayout />
            </RegistrationGuard>
          </AuthGuard>
        }
      >
        <Route index element={<OverviewScreen />} />
        <Route path="sessions" element={<SessionsInboxScreen />} />
        <Route path="sessions/:id" element={<SessionDetailScreen />} />
        <Route path="new" element={<NewSessionScreen />} />
        <Route path="storefront" element={<StorefrontMgmtScreen />} />
        <Route path="brand" element={<BrandScreen />} />
      </Route>
    </Route>
  );
}
