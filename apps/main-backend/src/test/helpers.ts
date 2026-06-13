import type { Express } from 'express';
import supertest from 'supertest';

import { buildApp } from '../app.js';

export const app: Express = buildApp();
export const api = (): supertest.Agent => supertest.agent(app);

export interface SeededSeller {
  token: string;
  refreshToken: string;
  sellerId: string;
  slug: string;
  email: string;
}

let counter = 0;

/** Register a fresh seller and return its tokens + identity. */
export const seedSeller = async (overrides?: {
  email?: string;
  business?: string;
}): Promise<SeededSeller> => {
  counter += 1;
  const email = overrides?.email ?? `seller${counter}@test.test`;
  const business = overrides?.business ?? `Shop ${counter}`;

  const res = await api()
    .post('/api/v1/auth/register')
    .send({ email, business_name: business, password: 'Password123!' });

  if (res.status !== 201) {
    throw new Error(`seedSeller register failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  const { seller, access_token, refresh_token } = res.body.data;
  return {
    token: access_token,
    refreshToken: refresh_token,
    sellerId: seller.id,
    slug: seller.public_slug,
    email,
  };
};

/** Authorization header tuple for supertest `.set(...)`. */
export const bearer = (token: string): [string, string] => ['Authorization', `Bearer ${token}`];
