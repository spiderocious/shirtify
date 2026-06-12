import { AuthResponse, SellerSchema } from '@shirtify/core';
import { describe, it, expect } from 'vitest';

import { api, seedSeller, bearer } from '../../test/helpers.js';

describe('auth', () => {
  it('registers a seller and returns a contract-valid AuthResponse', async () => {
    const res = await api()
      .post('/api/v1/auth/register')
      .send({ email: 'a@test.test', business_name: 'Aba Tees', password: 'Password123!' });

    expect(res.status).toBe(201);
    // Contract test: the response must parse through the shared schema.
    const parsed = AuthResponse.parse(res.body.data);
    expect(parsed.seller.email).toBe('a@test.test');
    expect(parsed.seller.public_slug).toBe('aba-tees');
    expect(parsed.access_token).toBeTruthy();
  });

  it('rejects duplicate email with 409 conflict', async () => {
    await seedSeller({ email: 'dup@test.test' });
    const res = await api()
      .post('/api/v1/auth/register')
      .send({ email: 'dup@test.test', business_name: 'X', password: 'Password123!' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('conflict');
  });

  it('rejects invalid registration body with 400 validation_error', async () => {
    const res = await api()
      .post('/api/v1/auth/register')
      .send({ email: 'not-an-email', business_name: '', password: 'short' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('validation_error');
    expect(res.body.error.field_errors).toBeDefined();
  });

  it('logs in with correct credentials, rejects wrong password', async () => {
    await seedSeller({ email: 'login@test.test' });

    const ok = await api()
      .post('/api/v1/auth/login')
      .send({ email: 'login@test.test', password: 'Password123!' });
    expect(ok.status).toBe(200);
    expect(AuthResponse.parse(ok.body.data).seller.email).toBe('login@test.test');

    const bad = await api()
      .post('/api/v1/auth/login')
      .send({ email: 'login@test.test', password: 'WrongPass123' });
    expect(bad.status).toBe(401);
    expect(bad.body.error.code).toBe('unauthorized');
  });

  it('returns the current seller from /me with a valid token, 401 without', async () => {
    const seller = await seedSeller();

    const authed = await api().get('/api/v1/me').set(...bearer(seller.token));
    expect(authed.status).toBe(200);
    expect(SellerSchema.parse(authed.body.data.seller).id).toBe(seller.sellerId);

    const anon = await api().get('/api/v1/me');
    expect(anon.status).toBe(401);
  });

  it('refreshes tokens', async () => {
    const seller = await seedSeller();
    const res = await api()
      .post('/api/v1/auth/refresh')
      .send({ refresh_token: seller.refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.data.access_token).toBeTruthy();
    expect(res.body.data.refresh_token).toBeTruthy();
  });
});
