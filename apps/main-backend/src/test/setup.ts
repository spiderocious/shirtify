import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { afterAll, afterEach, beforeAll } from 'vitest';

// Env must be set BEFORE any module that imports `env.ts` is loaded.
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_at_least_32_chars_long_ok';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_at_least_32_chars_long_ok';
process.env.APP_BASE_URL = 'http://localhost:8081';
process.env.WEB_BASE_URL = 'http://localhost:5173';
process.env.LOG_LEVEL = 'error';

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterEach(async () => {
  // Truncate between tests — never drop/recreate the container (hard-lessons).
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});
