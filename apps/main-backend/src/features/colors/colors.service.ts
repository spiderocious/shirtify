import { slugify, type Color, type CreateColorBody } from '@shirtify/core';

import { ConflictError, NotFoundError, ValidationError } from '@lib/errors.js';
import { getRepos } from '@repos/index.js';

/** Colours available to a seller: platform defaults ∪ her own. */
export const listSellerColors = async (sellerId: string): Promise<Color[]> => {
  const repos = getRepos();
  return repos.colors.listForSeller(sellerId);
};

/**
 * Assert a `shirt_color` slug is valid for a seller (platform ∪ her own).
 * Throws a 400 validation_error otherwise. The single choke-point both session
 * creation and storefront walk-ins call, so out-of-catalogue colours can't persist.
 */
export const assertColorAvailable = async (
  sellerId: string,
  slug: string,
): Promise<void> => {
  const repos = getRepos();
  const colors = await repos.colors.listForSeller(sellerId);
  if (!colors.some((c) => c.slug === slug)) {
    throw new ValidationError('Unknown shirt colour for this seller', {
      shirt_color: [`"${slug}" is not in this seller's colour set`],
    });
  }
};

export const addSellerColor = async (
  sellerId: string,
  input: CreateColorBody,
): Promise<Color> => {
  const repos = getRepos();
  const slug = input.slug ?? slugify(input.label);

  const existing = await repos.colors.listForSeller(sellerId);
  if (existing.some((c) => c.slug === slug)) {
    throw new ConflictError(`A colour with slug "${slug}" already exists`);
  }

  return repos.colors.create({
    scope: 'seller',
    seller_id: sellerId,
    slug,
    label: input.label,
    hex: input.hex,
  });
};

export const removeSellerColor = async (sellerId: string, id: string): Promise<void> => {
  const repos = getRepos();
  const color = await repos.colors.bySellerAndId(sellerId, id);
  if (!color) throw new NotFoundError('Colour'); // 404 if platform or not hers
  await repos.colors.remove(id);
};
