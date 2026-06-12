import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(8081),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error']).default('info'),

  APP_BASE_URL: z.string().url(),
  WEB_BASE_URL: z.string().url(),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // Database
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/shirtify'),

  // Storage — external R2 file-service (presigned-URL proxy)
  FILE_SERVICE_URL: z.string().url().default('https://go-file-service-production.up.railway.app'),

  // Web push (optional in dev; required to actually send notifications)
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().default('mailto:hello@shirtify.app'),

  // Seed seller (used by `pnpm seed`)
  SEED_SELLER_EMAIL: z.string().email().default('her@shirtify.app'),
  SEED_SELLER_PASSWORD: z.string().min(8).default('changeme123'),
  SEED_SELLER_BUSINESS: z.string().default('Shirtify'),
});

export type Env = z.infer<typeof EnvSchema>;

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n');
  throw new Error(`Invalid environment variables:\n${issues}`);
}

export const env: Env = parsed.data;
