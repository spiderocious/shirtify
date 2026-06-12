import type { Express } from 'express';

import sessionsRoutes from './sessions.routes.js';

export const register = (app: Express): void => {
  app.use('/api/v1/sessions', sessionsRoutes);
};
