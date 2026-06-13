import { SHIRT_TYPES, SHIRT_TYPE_LABELS } from '@shirtify/core';

import { getRepos } from '@repos/index.js';

/**
 * Seed the 4 built-in materials (tee/hoodie/polo/oversized) as platform
 * materials with vector silhouettes (no uploaded image). Sellers add their own
 * image-backed materials on top. Idempotent — safe on every boot.
 */
export const seedPlatformMaterials = async (): Promise<void> => {
  const repos = getRepos();
  await Promise.all(
    SHIRT_TYPES.map((slug) =>
      repos.materials.ensurePlatform({
        slug,
        label: SHIRT_TYPE_LABELS[slug],
        builtin_shape: slug,
      }),
    ),
  );
};
