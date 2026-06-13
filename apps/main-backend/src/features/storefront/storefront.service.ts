import {
  emptyScene,
  generateToken,
  SHIRT_TYPES,
  type Material,
  type PublicBrand,
  type ShirtType,
} from '@shirtify/core';

import { assertColorAvailable } from '@features/colors/colors.service.js';
import { assertMaterialAvailable } from '@features/materials/materials.service.js';
import { NotFoundError } from '@lib/errors.js';
import { getRepos } from '@repos/index.js';
import { toPublicBrand } from '@shared/brand.js';

export const getStorefront = async (
  slug: string,
): Promise<{
  brand: PublicBrand;
  shirt_types: string[];
  shirt_colors: string[];
  materials: Material[];
}> => {
  const repos = getRepos();
  const seller = await repos.sellers.bySlug(slug);
  if (!seller) throw new NotFoundError('Storefront');

  // Resolve THIS seller's colours + materials (platform ∪ her own).
  const [colors, allMaterials] = await Promise.all([
    repos.colors.listForSeller(seller.id),
    repos.materials.listForSeller(seller.id),
  ]);

  // Filter materials by the seller's visible-materials config (null = show all).
  const visible = seller.visible_materials;
  const materials =
    visible === null ? allMaterials : allMaterials.filter((m) => visible.includes(m.slug));

  return {
    brand: toPublicBrand(seller),
    shirt_types: [...SHIRT_TYPES],
    shirt_colors: colors.map((c) => c.slug),
    materials,
  };
};

const uniqueToken = async (): Promise<string> => {
  const repos = getRepos();
  let token = generateToken(8);
   
  while (await repos.sessions.tokenExists(token)) {
    token = generateToken(8);
  }
  return token;
};

/** Cold walk-in: create a public session and return its token. */
export const startPublicSession = async (
  slug: string,
  input: { shirt_type: ShirtType; shirt_color: string; material_slug?: string },
): Promise<{ token: string }> => {
  const repos = getRepos();
  const seller = await repos.sellers.bySlug(slug);
  if (!seller) throw new NotFoundError('Storefront');

  await assertColorAvailable(seller.id, input.shirt_color);
  if (input.material_slug) await assertMaterialAvailable(seller.id, input.material_slug);

  const token = await uniqueToken();
  const session = await repos.sessions.create({
    seller_id: seller.id,
    kind: 'public',
    token,
    shirt_type: input.shirt_type,
    shirt_color: input.shirt_color,
    ...(input.material_slug !== undefined && { material_slug: input.material_slug }),
  });
  await repos.designs.createForSession(
    session.id,
    emptyScene(session.shirt_type, session.shirt_color),
    emptyScene(session.shirt_type, session.shirt_color),
  );
  return { token };
};
