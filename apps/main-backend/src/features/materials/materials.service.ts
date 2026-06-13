import { slugify, type Material, type CreateMaterialBody } from '@shirtify/core';

import { ConflictError, NotFoundError, ValidationError } from '@lib/errors.js';
import { getRepos } from '@repos/index.js';

/** Materials available to a seller: platform built-ins ∪ her own. */
export const listSellerMaterials = async (sellerId: string): Promise<Material[]> => {
  const repos = getRepos();
  return repos.materials.listForSeller(sellerId);
};

/** Assert a material slug is valid for a seller (platform ∪ her own). */
export const assertMaterialAvailable = async (sellerId: string, slug: string): Promise<void> => {
  const repos = getRepos();
  const materials = await repos.materials.listForSeller(sellerId);
  if (!materials.some((m) => m.slug === slug)) {
    throw new ValidationError('Unknown material for this seller', {
      material_slug: [`"${slug}" is not in this seller's materials`],
    });
  }
};

export const addSellerMaterial = async (
  sellerId: string,
  input: CreateMaterialBody,
): Promise<Material> => {
  const repos = getRepos();
  const slug = input.slug ?? slugify(input.label);
  const existing = await repos.materials.listForSeller(sellerId);
  if (existing.some((m) => m.slug === slug)) {
    throw new ConflictError(`A material with slug "${slug}" already exists`);
  }
  return repos.materials.create({
    scope: 'seller',
    seller_id: sellerId,
    slug,
    label: input.label,
    image_key: input.image_key,
  });
};

export const removeSellerMaterial = async (sellerId: string, id: string): Promise<void> => {
  const repos = getRepos();
  const material = await repos.materials.bySellerAndId(sellerId, id);
  if (!material) throw new NotFoundError('Material'); // 404 if platform or not hers
  await repos.materials.remove(id);
};
