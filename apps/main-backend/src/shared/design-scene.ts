import { emptyScene, type Scene, type ShirtType } from '@shirtify/core';

import { getRepos } from '@repos/index.js';

/**
 * Build a fresh scene for a session, resolving a custom material's image key onto
 * the scene's shirt so the canvas shows the uploaded photo as the backdrop.
 */
export const buildInitialScene = async (
  sellerId: string,
  type: ShirtType,
  color: string,
  materialSlug?: string,
): Promise<Scene> => {
  const scene = emptyScene(type, color);
  if (!materialSlug) return scene;

  const materials = await getRepos().materials.listForSeller(sellerId);
  const material = materials.find((m) => m.slug === materialSlug);
  if (material) {
    scene.shirt.materialId = material.slug;
    if (material.image_key) scene.shirt.materialImageKey = material.image_key;
  }
  return scene;
};
