import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { register as registerAuth } from '@features/auth/index.js';
import { register as registerColors } from '@features/colors/index.js';
import { register as registerHealth } from '@features/health/index.js';
import { register as registerMaterials } from '@features/materials/index.js';
import { register as registerNotifications } from '@features/notifications/index.js';
import { register as registerPublic } from '@features/public/index.js';
import { register as registerAi } from '@features/ai/index.js';
import { register as registerSessions } from '@features/sessions/index.js';
import { register as registerStorefront } from '@features/storefront/index.js';
import { errorHandler } from '@middlewares/errorHandler.middleware.js';
import { requestIdMiddleware } from '@middlewares/requestId.middleware.js';
import { requestLogMiddleware } from '@middlewares/requestLog.middleware.js';

// Order matters: specific/auth'd routes before the public token/slug surfaces.
const features = [
  registerHealth,
  registerAuth,
  registerColors,
  registerMaterials,
  registerNotifications,
  registerSessions,
  registerStorefront,
  registerAi,
  registerPublic,
];

export const buildApp = (): express.Express => {
  const app = express();

  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: "*",
      credentials: true,
    }),
  );

  app.use(requestIdMiddleware);
  app.use(requestLogMiddleware);

  // Global JSON limit stays tight (1mb), but skip the AI subtree — those routes
  // carry base64 images and mount their own larger parser (see features/ai).
  const jsonParser = express.json({ limit: '1mb' });
  app.use((req, res, next) => {
    if (req.path.includes('/ai/')) return next();
    return jsonParser(req, res, next);
  });
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(compression());

  features.forEach((register) => register(app));

  app.use((_req, res) => {
    res.status(404).json({ error: { code: 'not_found', message: 'Route not found' } });
  });

  app.use(errorHandler);

  return app;
};
