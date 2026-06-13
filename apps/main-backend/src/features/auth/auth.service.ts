import bcrypt from 'bcryptjs';

import {
  SellerSchema,
  slugify,
  type AuthResponse,
  type Seller,
  type UpdateBrandBody,
  type SubmitBusinessBody,
} from '@shirtify/core';

import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '@lib/auth/jwt.js';
import { ConflictError, UnauthorizedError, NotFoundError } from '@lib/errors.js';
import { getRepos } from '@repos/index.js';
import type { SellerRecord } from '@repos/ports.js';

/** Strip the password hash → the client-safe Seller shape. */
const toSeller = (record: SellerRecord): Seller => {
  const { password_hash: _ignored, ...seller } = record;
  return SellerSchema.parse(seller);
};

const issueTokens = (record: SellerRecord): AuthResponse => ({
  seller: toSeller(record),
  access_token: signAccessToken(record.id, record.role),
  refresh_token: signRefreshToken(record.id),
});

const uniqueSlug = async (business: string): Promise<string> => {
  const repos = getRepos();
  const base = slugify(business);
  let slug = base;
  let n = 1;
   
  while (await repos.sellers.slugExists(slug)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
};

export const registerSeller = async (input: {
  email: string;
  business_name: string;
  password: string;
}): Promise<AuthResponse> => {
  const repos = getRepos();
  const existing = await repos.sellers.byEmail(input.email);
  if (existing) throw new ConflictError('A seller with that email already exists');

  const password_hash = await bcrypt.hash(input.password, 10);
  const public_slug = await uniqueSlug(input.business_name);
  const record = await repos.sellers.create({
    email: input.email,
    password_hash,
    business_name: input.business_name,
    public_slug,
  });
  return issueTokens(record);
};

export const loginSeller = async (input: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const repos = getRepos();
  const record = await repos.sellers.byEmail(input.email);
  if (!record) throw new UnauthorizedError('Invalid email or password');

  const ok = await bcrypt.compare(input.password, record.password_hash);
  if (!ok) throw new UnauthorizedError('Invalid email or password');

  return issueTokens(record);
};

export const refreshTokens = async (
  refreshToken: string,
): Promise<{ access_token: string; refresh_token: string }> => {
  let sellerId: string;
  try {
    sellerId = verifyRefreshToken(refreshToken).sub;
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
  const repos = getRepos();
  const record = await repos.sellers.byId(sellerId);
  if (!record) throw new UnauthorizedError('Seller no longer exists');

  return {
    access_token: signAccessToken(record.id, record.role),
    refresh_token: signRefreshToken(record.id),
  };
};

export const getSellerById = async (id: string): Promise<Seller> => {
  const repos = getRepos();
  const record = await repos.sellers.byId(id);
  if (!record) throw new NotFoundError('Seller');
  return toSeller(record);
};

export const updateBrand = async (
  sellerId: string,
  patch: UpdateBrandBody,
): Promise<Seller> => {
  const repos = getRepos();
  // Build a defined-only patch (exactOptionalPropertyTypes-safe).
  const update: Record<string, unknown> = {};
  if (patch.business_name !== undefined) update.business_name = patch.business_name;
  if (patch.description !== undefined) update.description = patch.description;
  if (patch.welcome_voice !== undefined) update.welcome_voice = patch.welcome_voice;
  if (patch.brand_logo_key !== undefined) update.brand_logo_key = patch.brand_logo_key;
  if (patch.storefront_color !== undefined) update.storefront_color = patch.storefront_color;
  if (patch.storefront_font !== undefined) update.storefront_font = patch.storefront_font;
  if (patch.visible_materials !== undefined) update.visible_materials = patch.visible_materials;

  const record = await repos.sellers.patchBrand(sellerId, update);
  if (!record) throw new NotFoundError('Seller');
  return toSeller(record);
};

/**
 * Staged onboarding: persist the business details and advance the seller from
 * AWAITING_BUSINESS_SUBMISSION → BUSINESS_SUBMITTED (idempotent if re-submitted).
 */
export const submitBusiness = async (
  sellerId: string,
  input: SubmitBusinessBody,
): Promise<Seller> => {
  const repos = getRepos();
  const record = await repos.sellers.patchBrand(sellerId, {
    business_name: input.business_name,
    ...(input.description !== undefined && { description: input.description }),
    ...(input.storefront_color !== undefined && { storefront_color: input.storefront_color }),
    ...(input.storefront_font !== undefined && { storefront_font: input.storefront_font }),
    ...(input.brand_logo_key !== undefined && { brand_logo_key: input.brand_logo_key }),
    registration_status: 'BUSINESS_SUBMITTED',
  });
  if (!record) throw new NotFoundError('Seller');
  return toSeller(record);
};
