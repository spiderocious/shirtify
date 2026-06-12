import type { Express } from 'express';

import storefrontRoutes from './storefront.routes.js';

export const register = (app: Express): void => {
  app.use('/api/v1/s', storefrontRoutes);
};
