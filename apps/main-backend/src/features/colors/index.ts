import type { Express } from 'express';

import colorsRoutes from './colors.routes.js';

export const register = (app: Express): void => {
  app.use('/api/v1/colors', colorsRoutes);
};
