import bcrypt from 'bcryptjs';

import { SellerSchema, slugify, type AuthResponse, type Seller } from '@shirtify/core';

import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '@lib/auth/jwt.js';
import { ConflictError, UnauthorizedError, NotFoundError } from '@lib/errors.js';
import { getRepos } from '@repos/index.js';
import type { SellerRecord } from '@repos/ports.js';

/** Strip the password hash → the client-safe Seller shape. */
const toSeller = (record: SellerRecord): Seller =>
  SellerSchema.parse({
    id: record.id,
    email: record.email,
    business_name: record.business_name,
    public_slug: record.public_slug,
    brand_logo_key: record.brand_logo_key,
    brand_colors: record.brand_colors,
    welcome_voice: record.welcome_voice,
    role: record.role,
    created_at: record.created_at,
  });

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
