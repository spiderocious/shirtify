import bcrypt from 'bcryptjs';

import { slugify } from '@shirtify/core';

import { connectDb, disconnectDb } from '../db/connection.js';
import { env } from '../env.js';
import { getRepos } from '../repos/index.js';

/**
 * Seed seller #1 (her). Idempotent — skips if the email already exists.
 * Run with: pnpm --filter @shirtify/main-backend seed
 */
const run = async (): Promise<void> => {
  await connectDb(env.MONGODB_URI);
  const repos = getRepos();

  const existing = await repos.sellers.byEmail(env.SEED_SELLER_EMAIL);
  if (existing) {
    // eslint-disable-next-line no-console
    console.log(`seed: seller ${env.SEED_SELLER_EMAIL} already exists (${existing.id})`);
    await disconnectDb();
    return;
  }

  const password_hash = await bcrypt.hash(env.SEED_SELLER_PASSWORD, 10);
  let slug = slugify(env.SEED_SELLER_BUSINESS);
  if (await repos.sellers.slugExists(slug)) slug = `${slug}-1`;

  const seller = await repos.sellers.create({
    email: env.SEED_SELLER_EMAIL,
    password_hash,
    business_name: env.SEED_SELLER_BUSINESS,
    public_slug: slug,
  });

  // eslint-disable-next-line no-console
  console.log(`seed: created seller ${seller.email} (${seller.id}), storefront /s/${seller.public_slug}`);
  await disconnectDb();
};

run().catch((err) => {
   
  console.error('seed failed:', err);
  process.exit(1);
});
