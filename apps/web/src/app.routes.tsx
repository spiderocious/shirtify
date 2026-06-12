import { Route, Routes } from 'react-router-dom';

import { ROUTES } from '@repo/core';

import { HomeScreen } from '@features/health/home-screen.tsx';
import { ExampleScreen } from '@features/example/example-screen.tsx';

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<HomeScreen />} />
      <Route path={ROUTES.EXAMPLE} element={<ExampleScreen />} />
      <Route path="*" element={<HomeScreen />} />
    </Routes>
  );
}
