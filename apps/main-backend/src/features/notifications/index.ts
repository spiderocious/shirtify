import type { Express } from 'express';

import notificationsRoutes from './notifications.routes.js';

export const register = (app: Express): void => {
  app.use('/api/v1/notifications', notificationsRoutes);
};
