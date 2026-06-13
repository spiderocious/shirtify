import { createServer, type Server } from 'node:http';

import { logger } from '@lib/logger.js';

import { buildApp } from './app.js';
import { connectDb, disconnectDb } from './db/connection.js';
import { seedPlatformColors } from './db/seed-colors.js';
import { seedPlatformMaterials } from './db/seed-materials.js';
import { env } from './env.js';

const startHttpApp = async (): Promise<Server> => {
  await connectDb(env.MONGODB_URI);
  await seedPlatformColors();
  await seedPlatformMaterials();
  const app = buildApp();
  const server = createServer(app);
  server.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, 'main-backend listening');
  });
  return server;
};

const server = await startHttpApp();

const shutdown = async (signal: string): Promise<void> => {
  logger.info({ signal }, 'shutting down gracefully');
  await new Promise<void>((resolve) => server.close(() => resolve()));
  await disconnectDb();
  process.exit(0);
};

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});
process.on('SIGINT', () => {
  void shutdown('SIGINT');
});
