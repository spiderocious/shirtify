import type { Express } from 'express';

import materialsRoutes from './materials.routes.js';

export const register = (app: Express): void => {
  app.use('/api/v1/materials', materialsRoutes);
};
