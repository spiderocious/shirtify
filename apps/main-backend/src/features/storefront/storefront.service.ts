import {
  PublicBrandSchema,
  emptyScene,
  generateToken,
  SHIRT_TYPES,
  type PublicBrand,
  type ShirtType,
} from '@shirtify/core';

import { assertColorAvailable } from '@features/colors/colors.service.js';
import { NotFoundError } from '@lib/errors.js';
import { getRepos } from '@repos/index.js';
import type { SellerRecord } from '@repos/ports.js';

const toPublicBrand = (seller: SellerRecord): PublicBrand =>
  PublicBrandSchema.parse({
    business_name: seller.business_name,
    public_slug: seller.public_slug,
    brand_logo_key: seller.brand_logo_key,
    brand_colors: seller.brand_colors,
    welcome_voice: seller.welcome_voice,
  });

export const getStorefront = async (
  slug: string,
): Promise<{ brand: PublicBrand; shirt_types: string[]; shirt_colors: string[] }> => {
  const repos = getRepos();
  const seller = await repos.sellers.bySlug(slug);
  if (!seller) throw new NotFoundError('Storefront');

  // Resolve THIS seller's available colours (platform ∪ her own), not a global list.
  const colors = await repos.colors.listForSeller(seller.id);
  return {
    brand: toPublicBrand(seller),
    shirt_types: [...SHIRT_TYPES],
    shirt_colors: colors.map((c) => c.slug),
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
  input: { shirt_type: ShirtType; shirt_color: string },
): Promise<{ token: string }> => {
  const repos = getRepos();
  const seller = await repos.sellers.bySlug(slug);
  if (!seller) throw new NotFoundError('Storefront');

  await assertColorAvailable(seller.id, input.shirt_color);

  const token = await uniqueToken();
  const session = await repos.sessions.create({
    seller_id: seller.id,
    kind: 'public',
    token,
    shirt_type: input.shirt_type,
    shirt_color: input.shirt_color,
  });
  await repos.designs.createForSession(
    session.id,
    emptyScene(session.shirt_type, session.shirt_color),
    emptyScene(session.shirt_type, session.shirt_color),
  );
  return { token };
};
