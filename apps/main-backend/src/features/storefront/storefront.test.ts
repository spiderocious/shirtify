import { StorefrontResponse } from '@shirtify/core';
import { describe, it, expect } from 'vitest';

import { api, seedSeller, bearer } from '../../test/helpers.js';

describe('storefront (public "second in")', () => {
  it('returns brand + shirt options for a known slug', async () => {
    const seller = await seedSeller({ business: 'Lagos Threads' });
    const res = await api().get(`/api/v1/s/${seller.slug}`);
    expect(res.status).toBe(200);
    const data = StorefrontResponse.parse(res.body.data);
    expect(data.brand.business_name).toBe('Lagos Threads');
    expect(data.shirt_colors.length).toBeGreaterThan(0);
    // Materials (built-ins) appear as storefront items.
    expect(data.materials.map((m) => m.slug)).toContain('hoodie');
    expect(data.items.some((i) => i.kind === 'material')).toBe(true);
  });

  it('404s an unknown storefront', async () => {
    const res = await api().get('/api/v1/s/nope-nope');
    expect(res.status).toBe(404);
  });

  it('cold walk-in: start a public session → reachable at /c/:token → lands in the same inbox', async () => {
    const seller = await seedSeller();

    const start = await api()
      .post(`/api/v1/s/${seller.slug}/start`)
      .send({ shirt_type: 'tee', shirt_color: 'white' });
    expect(start.status).toBe(201);
    const token = start.body.data.token as string;
    expect(token).toHaveLength(8);

    // Reachable as a normal customer design link.
    const open = await api().get(`/api/v1/c/${token}`);
    expect(open.status).toBe(200);
    expect(open.body.data.session.kind).toBe('public');

    // Submit it...
    await api().post(`/api/v1/c/${token}/submit`).send({ customer_name: 'Walk-in Wale' });

    // ...and it shows in the seller's one inbox.
    const inbox = await api().get('/api/v1/sessions').set(...bearer(seller.token));
    const found = inbox.body.data.items.find(
      (s: { kind: string; customer_name: string | null }) =>
        s.kind === 'public' && s.customer_name === 'Walk-in Wale',
    );
    expect(found).toBeDefined();
    expect(found.status).toBe('submitted');
  });
});
