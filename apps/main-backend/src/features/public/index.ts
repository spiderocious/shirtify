import type { Express } from 'express';

import publicRoutes from './public.routes.js';

export const register = (app: Express): void => {
  app.use('/api/v1/c', publicRoutes);
};
