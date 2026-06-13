import type { Repositories } from './ports.js';
import { createMongoSellerRepo } from './mongo/seller.repo.js';
import { createMongoSessionRepo } from './mongo/session.repo.js';
import { createMongoDesignRepo } from './mongo/design.repo.js';
import { createMongoAssetRepo } from './mongo/asset.repo.js';
import { createMongoColorRepo } from './mongo/color.repo.js';
import { createMongoMaterialRepo } from './mongo/material.repo.js';
import { createMongoIdempotencyRepo } from './mongo/idempotency.repo.js';
import { createMongoPushSubscriptionRepo } from './mongo/push-subscription.repo.js';

/**
 * Composition root for the data layer. The ONE place that picks the concrete
 * (Mongo) adapter. Services receive `repos` and never know which DB backs it —
 * swapping engines means changing only this file.
 */
let repos: Repositories | null = null;

export const getRepos = (): Repositories => {
  if (!repos) {
    repos = {
      sellers: createMongoSellerRepo(),
      sessions: createMongoSessionRepo(),
      designs: createMongoDesignRepo(),
      assets: createMongoAssetRepo(),
      colors: createMongoColorRepo(),
      materials: createMongoMaterialRepo(),
      idempotency: createMongoIdempotencyRepo(),
      pushSubscriptions: createMongoPushSubscriptionRepo(),
    };
  }
  return repos;
};

export type { Repositories } from './ports.js';
