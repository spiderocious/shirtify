import { BannerHost, ModalHost, ToastHost } from '@shirtify/ui';

import { AppProviders } from './app.provider.tsx';
import { AppRoutes } from './app.routes.tsx';

export function App() {
  return (
    <AppProviders>
      <AppRoutes />
      {/* DrawerService overlay hosts — mounted once at the app root. */}
      <ToastHost />
      <BannerHost />
      <ModalHost />
    </AppProviders>
  );
}
