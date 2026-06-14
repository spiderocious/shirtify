import express, { type Express } from 'express';

import aiRoutes from './ai.routes.js';

/**
 * AI routes carry base64 images (a person photo + a canvas snapshot for
 * try-on), which blow past the global 1mb JSON limit. Mount a larger parser
 * scoped to this subtree only — the rest of the API stays tight.
 */
export const register = (app: Express): void => {
  app.use('/api/v1/c', express.json({ limit: '25mb' }), aiRoutes);
};
