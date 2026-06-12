import { ColorSchema } from '@shirtify/core';
import { describe, it, expect } from 'vitest';

import { api, seedSeller, bearer } from '../../test/helpers.js';

describe('colours (BUG-01: DB-backed, per-seller validation)', () => {
  it('lists the 8 seeded platform colours for a seller', async () => {
    const seller = await seedSeller();
    const res = await api().get('/api/v1/colors').set(...bearer(seller.token));
    expect(res.status).toBe(200);
    const colors = res.body.data.colors.map((c: unknown) => ColorSchema.parse(c));
    const platform = colors.filter((c: { scope: string }) => c.scope === 'platform');
    expect(platform.length).toBe(8);
    expect(platform.map((c: { slug: string }) => c.slug)).toContain('lime');
  });

  it('rejects a session with an out-of-catalogue colour (the original bug)', async () => {
    const seller = await seedSeller();
    const res = await api()
      .post('/api/v1/sessions')
      .set(...bearer(seller.token))
      .send({ shirt_type: 'tee', shirt_color: 'chartreuse' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('validation_error');
    expect(res.body.error.field_errors.shirt_color).toBeDefined();
  });

  it('accepts a session with a platform colour', async () => {
    const seller = await seedSeller();
    const res = await api()
      .post('/api/v1/sessions')
      .set(...bearer(seller.token))
      .send({ shirt_type: 'tee', shirt_color: 'navy' });
    expect(res.status).toBe(201);
  });

  it('lets a seller add her own colour, then use it on a session', async () => {
    const seller = await seedSeller();
    const add = await api()
      .post('/api/v1/colors')
      .set(...bearer(seller.token))
      .send({ label: 'Owambe Gold', hex: '#d4af37' });
    expect(add.status).toBe(201);
    expect(add.body.data.color.slug).toBe('owambe-gold');
    expect(add.body.data.color.scope).toBe('seller');

    const session = await api()
      .post('/api/v1/sessions')
      .set(...bearer(seller.token))
      .send({ shirt_type: 'tee', shirt_color: 'owambe-gold' });
    expect(session.status).toBe(201);
  });

  it('keeps seller colours isolated — one seller cannot use another\'s colour', async () => {
    const a = await seedSeller();
    const b = await seedSeller();
    await api()
      .post('/api/v1/colors')
      .set(...bearer(a.token))
      .send({ label: 'Aba Special', hex: '#123456' });

    // Seller B never sees or can use A's colour.
    const bColors = await api().get('/api/v1/colors').set(...bearer(b.token));
    expect(bColors.body.data.colors.some((c: { slug: string }) => c.slug === 'aba-special')).toBe(false);

    const res = await api()
      .post('/api/v1/sessions')
      .set(...bearer(b.token))
      .send({ shirt_type: 'tee', shirt_color: 'aba-special' });
    expect(res.status).toBe(400);
  });

  it('rejects an invalid hex, and duplicate slug (409)', async () => {
    const seller = await seedSeller();
    const bad = await api()
      .post('/api/v1/colors')
      .set(...bearer(seller.token))
      .send({ label: 'Bad', hex: 'not-a-hex' });
    expect(bad.status).toBe(400);

    await api().post('/api/v1/colors').set(...bearer(seller.token)).send({ label: 'Teal', hex: '#008080' });
    const dup = await api()
      .post('/api/v1/colors')
      .set(...bearer(seller.token))
      .send({ label: 'Teal', hex: '#008080' });
    expect(dup.status).toBe(409);
  });

  it('cannot delete a platform colour (404), can delete own', async () => {
    const seller = await seedSeller();
    const list = await api().get('/api/v1/colors').set(...bearer(seller.token));
    const platform = list.body.data.colors.find((c: { scope: string }) => c.scope === 'platform');
    const delPlatform = await api()
      .delete(`/api/v1/colors/${platform.id}`)
      .set(...bearer(seller.token));
    expect(delPlatform.status).toBe(404);

    const add = await api()
      .post('/api/v1/colors')
      .set(...bearer(seller.token))
      .send({ label: 'Mine', hex: '#abcdef' });
    const delMine = await api()
      .delete(`/api/v1/colors/${add.body.data.color.id}`)
      .set(...bearer(seller.token));
    expect(delMine.status).toBe(204);
  });
});
