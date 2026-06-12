import {
  SessionSchema,
  SessionDetailResponse,
  PublicSessionResponse,
  DesignSchema,
  emptyScene,
} from '@shirtify/core';
import { describe, it, expect } from 'vitest';

import { api, seedSeller, bearer } from '../../test/helpers.js';

const createSession = async (token: string) => {
  const res = await api()
    .post('/api/v1/sessions')
    .set(...bearer(token))
    .send({ customer_name: 'Tobi', shirt_type: 'hoodie', shirt_color: 'black' });
  return res;
};

describe('sessions + public design flow', () => {
  it('creates a session with a generated 8-char token and a blank design', async () => {
    const seller = await seedSeller();
    const res = await createSession(seller.token);

    expect(res.status).toBe(201);
    const session = SessionSchema.parse(res.body.data.session);
    expect(session.token).toHaveLength(8);
    expect(session.kind).toBe('custom');
    expect(session.status).toBe('in_progress');
  });

  it('requires auth to create a session', async () => {
    const res = await api()
      .post('/api/v1/sessions')
      .send({ shirt_type: 'tee', shirt_color: 'white' });
    expect(res.status).toBe(401);
  });

  it('lists sessions with cursor pagination meta on both sides', async () => {
    const seller = await seedSeller();
    for (let i = 0; i < 3; i++) await createSession(seller.token);

    const res = await api()
      .get('/api/v1/sessions?limit=2')
      .set(...bearer(seller.token));
    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(2);
    // Contract: meta carries nextCursor + hasMore.
    expect(res.body.meta.hasMore).toBe(true);
    expect(typeof res.body.meta.nextCursor).toBe('string');

    const page2 = await api()
      .get(`/api/v1/sessions?limit=2&cursor=${res.body.meta.nextCursor}`)
      .set(...bearer(seller.token));
    expect(page2.body.data.items).toHaveLength(1);
    expect(page2.body.meta.hasMore).toBe(false);
    expect(page2.body.meta.nextCursor).toBeNull();
  });

  it('does not leak another seller\'s session (404, not 403-data)', async () => {
    const a = await seedSeller();
    const b = await seedSeller();
    const created = await createSession(a.token);
    const id = created.body.data.session.id;

    const res = await api().get(`/api/v1/sessions/${id}`).set(...bearer(b.token));
    expect(res.status).toBe(404);
  });

  it('runs the full customer round-trip: open → autosave → asset → submit → seller sees it', async () => {
    const seller = await seedSeller();
    const created = await createSession(seller.token);
    const token = created.body.data.session.token as string;

    // Customer opens the link (public, no auth).
    const open = await api().get(`/api/v1/c/${token}`);
    expect(open.status).toBe(200);
    const ctx = PublicSessionResponse.parse(open.body.data);
    expect(ctx.brand.business_name).toBeTruthy();
    expect(ctx.session.customer_name).toBe('Tobi');

    // Autosave a text design.
    const scene = emptyScene('hoodie', 'black');
    scene.layers.push({
      id: 'l1',
      kind: 'text',
      x: 0.5,
      y: 0.5,
      scale: 1,
      rotation: 0,
      opacity: 1,
      text: 'OWAMBE 2026',
      font: 'archivo-black',
      color: '#ffffff',
    });
    const save = await api()
      .put(`/api/v1/c/${token}/design`)
      .send({ canvas_front: scene, canvas_back: emptyScene('hoodie', 'black') });
    expect(save.status).toBe(200);
    expect(DesignSchema.parse(save.body.data.design).canvas_front.layers).toHaveLength(1);

    // Register an uploaded image asset (R2 key recorded; no bytes through us).
    const asset = await api()
      .post(`/api/v1/c/${token}/assets`)
      .send({ storage_key: 'abc123.png', mime: 'image/png', width: 800, height: 800 });
    expect(asset.status).toBe(201);
    expect(asset.body.data.asset.storage_key).toBe('abc123.png');

    // Submit.
    const submit = await api().post(`/api/v1/c/${token}/submit`).send({});
    expect(submit.status).toBe(200);
    expect(submit.body.data.session.status).toBe('submitted');

    // Seller sees the submitted design.
    const id = created.body.data.session.id;
    const detail = await api().get(`/api/v1/sessions/${id}`).set(...bearer(seller.token));
    const parsed = SessionDetailResponse.parse(detail.body.data);
    expect(parsed.session.status).toBe('submitted');
    expect(parsed.design.submitted_at).not.toBeNull();
    expect(parsed.design.canvas_front.layers).toHaveLength(1);
  });

  it('rejects autosave/submit after a session is submitted (409)', async () => {
    const seller = await seedSeller();
    const created = await createSession(seller.token);
    const token = created.body.data.session.token as string;

    await api().post(`/api/v1/c/${token}/submit`).send({});
    const again = await api().post(`/api/v1/c/${token}/submit`).send({});
    expect(again.status).toBe(409);
  });

  it('returns 404 for an unknown token', async () => {
    const res = await api().get('/api/v1/c/zzzzzzzz');
    expect(res.status).toBe(404);
  });
});
