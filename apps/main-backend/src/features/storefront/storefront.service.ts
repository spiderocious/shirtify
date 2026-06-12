import {
  PublicBrandSchema,
  emptyScene,
  generateToken,
  SHIRT_TYPES,
  SHIRT_COLORS,
  type PublicBrand,
  type ShirtType,
} from '@shirtify/core';

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

  return {
    brand: toPublicBrand(seller),
    shirt_types: [...SHIRT_TYPES],
    shirt_colors: SHIRT_COLORS.map((c) => c.id),
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
