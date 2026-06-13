import { afterEach, describe, it, expect } from 'vitest';

import { __setRateLimitEnabled } from '../../middlewares/rateLimit.middleware.js';
import { api, seedSeller, bearer } from '../../test/helpers.js';

describe('hardening (BUG-02 / 03 / 04)', () => {
  // The limiter is off by default in tests; turn it back off after this file.
  afterEach(() => __setRateLimitEnabled(false));
  it('BUG-02: malformed JSON body returns 400, not 500', async () => {
    const res = await api()
      .post('/api/v1/auth/login')
      .set('Content-Type', 'application/json')
      .send('{bad json');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('validation_error');
    expect(res.body.error.message).toMatch(/malformed/i);
  });

  it('BUG-03: /auth/login rate-limits after the window cap with 429 + Retry-After', async () => {
    __setRateLimitEnabled(true); // enable for this assertion only
    // Limiter: 10 per 15min per IP. The 11th attempt should be throttled.
    let throttled: { status: number; retryAfter: string | undefined } | null = null;
    for (let i = 0; i < 12; i++) {
       
      const res = await api()
        .post('/api/v1/auth/login')
        .send({ email: 'nobody@test.test', password: 'WrongPass123' });
      if (res.status === 429) {
        throttled = { status: res.status, retryAfter: res.headers['retry-after'] };
        break;
      }
    }
    expect(throttled).not.toBeNull();
    expect(throttled?.status).toBe(429);
    expect(throttled?.retryAfter).toBeDefined();
  });

  it('BUG-04: same Idempotency-Key on POST /sessions returns the same session, no duplicate', async () => {
    const seller = await seedSeller();
    const key = 'idem-key-abc-123';
    const payload = { shirt_type: 'tee', shirt_color: 'white' };

    const first = await api()
      .post('/api/v1/sessions')
      .set(...bearer(seller.token))
      .set('Idempotency-Key', key)
      .send(payload);
    const second = await api()
      .post('/api/v1/sessions')
      .set(...bearer(seller.token))
      .set('Idempotency-Key', key)
      .send(payload);

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    // Same session id + token — not a duplicate.
    expect(second.body.data.session.id).toBe(first.body.data.session.id);
    expect(second.body.data.session.token).toBe(first.body.data.session.token);

    // And the inbox shows exactly one.
    const inbox = await api().get('/api/v1/sessions').set(...bearer(seller.token));
    expect(inbox.body.data.items).toHaveLength(1);
  });

  it('BUG-04: no key → distinct sessions (idempotency is opt-in)', async () => {
    const seller = await seedSeller();
    const payload = { shirt_type: 'tee', shirt_color: 'white' };
    const a = await api().post('/api/v1/sessions').set(...bearer(seller.token)).send(payload);
    const b = await api().post('/api/v1/sessions').set(...bearer(seller.token)).send(payload);
    expect(a.body.data.session.id).not.toBe(b.body.data.session.id);
  });
});
