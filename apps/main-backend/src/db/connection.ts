import mongoose from 'mongoose';

import { logger } from '@lib/logger.js';

/**
 * Mongoose connection lifecycle. The ONLY place that talks to mongoose at the
 * process level — repositories use models, never the connection directly.
 */
export const connectDb = async (uri: string): Promise<typeof mongoose> => {
  mongoose.set('strictQuery', true);
  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
  logger.info({ host: conn.connection.host, db: conn.connection.name }, 'mongodb connected');
  return conn;
};

export const disconnectDb = async (): Promise<void> => {
  await mongoose.disconnect();
};
