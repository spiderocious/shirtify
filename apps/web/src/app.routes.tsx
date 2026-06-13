import { ROUTES } from '@shirtify/core';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import { HomeScreen } from '@features/health/home-screen.tsx';
import { PreviewScreen } from '@features/preview/preview-screen.tsx';
import { SellerRoutes } from '@features/sellers/sellers.routes.tsx';

const DesignScreen = lazy(() => import('@features/design/screen/design-screen.tsx'));
const StorefrontScreen = lazy(() => import('@features/storefront/screen/storefront-screen.tsx'));

export function AppRoutes() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path={ROUTES.HOME} element={<HomeScreen />} />
        <Route path={ROUTES.PREVIEW} element={<PreviewScreen />} />

        {/* Customer-facing surfaces (token / slug is the key, no auth). */}
        <Route path="/c/:token" element={<DesignScreen />} />
        <Route path="/s/:slug" element={<StorefrontScreen />} />

        {/* Seller dashboard subtree (owned by the sellers feature). */}
        {SellerRoutes()}

        <Route path="*" element={<HomeScreen />} />
      </Routes>
    </Suspense>
  );
}
