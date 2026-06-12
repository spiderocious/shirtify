import { SHIRT_COLORS } from '@shirtify/core';

import { getRepos } from '@repos/index.js';

/**
 * Idempotently seed the platform colour catalogue from the curated defaults.
 * Safe to run on every boot — `ensurePlatform` upserts by slug. Admins/sellers
 * extend the catalogue at runtime; this just guarantees the defaults exist.
 */
export const seedPlatformColors = async (): Promise<void> => {
  const repos = getRepos();
  await Promise.all(
    SHIRT_COLORS.map((c) =>
      repos.colors.ensurePlatform({ slug: c.id, label: c.label, hex: c.hex }),
    ),
  );
};
