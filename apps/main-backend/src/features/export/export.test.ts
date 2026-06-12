import { emptyScene } from '@shirtify/core';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { api, seedSeller, bearer } from '../../test/helpers.js';

/**
 * The export pipeline renders with @napi-rs/canvas (real) but must NOT hit the
 * network. We stub the file-service endpoints on global fetch: get-upload-uri,
 * the PUT, and get-file-uri. Image-layer fetches aren't exercised here (text only).
 */
const realFetch = globalThis.fetch;

beforeEach(() => {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.includes('/get-upload-uri')) {
      return new Response(
        JSON.stringify({ key: 'export-123.png', uri: 'https://storage.test/put/export-123.png' }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    }
    if (url.includes('/get-file-uri')) {
      return new Response(JSON.stringify({ uri: 'https://storage.test/view/export-123.png' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    if (init?.method === 'PUT') {
      return new Response(null, { status: 200 });
    }
    return realFetch(input, init);
  });
});

afterEach(() => vi.restoreAllMocks());

describe('export', () => {
  const createSubmitted = async (token: string) => {
    const created = await api()
      .post('/api/v1/sessions')
      .set(...bearer(token))
      .send({ shirt_type: 'tee', shirt_color: 'white' });
    const sessionToken = created.body.data.session.token as string;

    const scene = emptyScene('tee', 'white');
    scene.layers.push({
      id: 'l1',
      kind: 'text',
      x: 0.5,
      y: 0.5,
      scale: 1,
      rotation: 0,
      opacity: 1,
      text: 'HELLO',
      font: 'archivo-black',
      color: '#000000',
    });
    await api()
      .put(`/api/v1/c/${sessionToken}/design`)
      .send({ canvas_front: scene, canvas_back: emptyScene('tee', 'white') });

    return created.body.data.session.id as string;
  };

  it('renders a preset export to a PNG and returns key + url', async () => {
    const seller = await seedSeller();
    const id = await createSubmitted(seller.token);

    const res = await api()
      .post(`/api/v1/sessions/${id}/export`)
      .set(...bearer(seller.token))
      .send({ preset: 'web', side: 'front' });

    expect(res.status).toBe(200);
    expect(res.body.data.key).toBe('export-123.png');
    expect(res.body.data.url).toContain('storage.test');
  });

  it('accepts a custom size', async () => {
    const seller = await seedSeller();
    const id = await createSubmitted(seller.token);

    const res = await api()
      .post(`/api/v1/sessions/${id}/export`)
      .set(...bearer(seller.token))
      .send({ w: 512, h: 512, dpi: 150, side: 'front' });
    expect(res.status).toBe(200);
  });

  it('rejects an export with neither preset nor size (400)', async () => {
    const seller = await seedSeller();
    const id = await createSubmitted(seller.token);

    const res = await api()
      .post(`/api/v1/sessions/${id}/export`)
      .set(...bearer(seller.token))
      .send({ side: 'front' });
    expect(res.status).toBe(400);
  });
});
