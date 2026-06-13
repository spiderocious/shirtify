import { Outlet } from 'react-router-dom';

import { DashboardHeader } from './parts/dashboard-header.tsx';

/** Chrome shared by every authenticated dashboard screen. */
export default function DashboardLayout() {
  return (
    <div className="min-h-dvh bg-paper">
      <DashboardHeader />
      <Outlet />
    </div>
  );
}
