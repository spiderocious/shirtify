import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    setupFiles: ['./src/test/setup.ts'],
    testTimeout: 30000,
    hookTimeout: 60000,
    fileParallelism: false,
  },
  resolve: {
    alias: {
      '@features': new URL('./src/features', import.meta.url).pathname,
      '@lib': new URL('./src/lib', import.meta.url).pathname,
      '@middlewares': new URL('./src/middlewares', import.meta.url).pathname,
      '@shared': new URL('./src/shared', import.meta.url).pathname,
      '@db': new URL('./src/db', import.meta.url).pathname,
      '@repos': new URL('./src/repos', import.meta.url).pathname,
    },
  },
});
