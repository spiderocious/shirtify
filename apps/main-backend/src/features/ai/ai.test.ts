import { AiJobSchema, emptyScene } from '@shirtify/core';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { api, seedSeller, bearer } from '../../test/helpers.js';

/**
 * The AI pipeline runs the *fake* provider in test (env forces it), so no key
 * or model is hit. But results still flow through R2 — so we stub the
 * file-service on global fetch: get-upload-uri, the PUT, get-file-uri, and a
 * GET that returns image bytes (the edit base fetch).
 */
const realFetch = globalThis.fetch;
let uploadCount = 0;

beforeEach(() => {
  uploadCount = 0;
  vi.spyOn(globalThis, 'fetch').mockImplementation(
    async (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url.includes('/get-upload-uri')) {
        uploadCount += 1;
        return new Response(
          JSON.stringify({ key: `ai-${uploadCount}.png`, uri: `https://storage.test/put/ai-${uploadCount}.png` }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        );
      }
      if (url.includes('/get-file-uri')) {
        return new Response(JSON.stringify({ uri: 'https://storage.test/view/base.png' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      }
      if (init?.method === 'PUT') return new Response(null, { status: 200 });
      // The edit base fetch (GET the view url) → return a tiny PNG.
      if (url.startsWith('https://storage.test/view/')) {
        return new Response(Buffer.from([0x89, 0x50, 0x4e, 0x47]), {
          status: 200,
          headers: { 'content-type': 'image/png' },
        });
      }
      return realFetch(input, init);
    },
  );
});

afterEach(() => vi.restoreAllMocks());

const newSessionToken = async (sellerToken: string): Promise<string> => {
  const res = await api()
    .post('/api/v1/sessions')
    .set(...bearer(sellerToken))
    .send({ shirt_type: 'tee', shirt_color: 'white' });
  return res.body.data.session.token as string;
};

/** Poll a job until it leaves `pending`/`running` (fake provider is fast). */
const pollJob = async (token: string, jobId: string) => {
  for (let i = 0; i < 40; i++) {
    const res = await api().get(`/api/v1/c/${token}/ai/jobs/${jobId}`);
    const job = AiJobSchema.parse(res.body.data.job);
    if (job.status === 'done' || job.status === 'failed') return job;
    await new Promise((r) => setTimeout(r, 25));
  }
  throw new Error('job did not settle');
};

describe('AI design surface', () => {
  it('generate: accepts a prompt (202) and resolves to 3 image options', async () => {
    const seller = await seedSeller();
    const token = await newSessionToken(seller.token);

    const res = await api()
      .post(`/api/v1/c/${token}/ai/generate`)
      .send({ prompt: 'a Lagos street art vibe' });
    expect(res.status).toBe(201);
    const accepted = AiJobSchema.parse(res.body.data.job);
    expect(accepted.kind).toBe('generate');
    expect(['pending', 'running']).toContain(accepted.status);

    const done = await pollJob(token, accepted.id);
    expect(done.status).toBe('done');
    expect(done.results).toHaveLength(3);
    expect(done.results[0]!.storage_key).toMatch(/\.png$/);
  });

  it('edit: regenerates from a base key and echoes the layer id', async () => {
    const seller = await seedSeller();
    const token = await newSessionToken(seller.token);

    const res = await api()
      .post(`/api/v1/c/${token}/ai/edit`)
      .send({ layer_id: 'layer-9', base_storage_key: 'base.png', instruction: 'make it bolder' });
    expect(res.status).toBe(201);
    const job = await pollJob(token, AiJobSchema.parse(res.body.data.job).id);
    expect(job.status).toBe('done');
    expect(job.layer_id).toBe('layer-9');
    expect(job.results.length).toBeGreaterThan(0);
  });

  it('tryon: composites a person photo + design snapshot into one result', async () => {
    const seller = await seedSeller();
    const token = await newSessionToken(seller.token);
    const px =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

    const res = await api()
      .post(`/api/v1/c/${token}/ai/tryon`)
      .send({ person_image: px, design_snapshot: px, note: 'outdoors' });
    expect(res.status).toBe(201);
    const job = await pollJob(token, AiJobSchema.parse(res.body.data.job).id);
    expect(job.status).toBe('done');
    expect(job.results).toHaveLength(1);
  });

  it('rejects an empty prompt', async () => {
    const seller = await seedSeller();
    const token = await newSessionToken(seller.token);
    const res = await api().post(`/api/v1/c/${token}/ai/generate`).send({ prompt: '' });
    expect(res.status).toBe(400);
  });

  it('refuses generation on a submitted session', async () => {
    const seller = await seedSeller();
    const token = await newSessionToken(seller.token);
    // Save + submit to lock the session.
    const scene = emptyScene('tee', 'white');
    await api().put(`/api/v1/c/${token}/design`).send({ canvas_front: scene, canvas_back: scene });
    await api().post(`/api/v1/c/${token}/submit`).send({ customer_name: 'Tobi' });

    const res = await api()
      .post(`/api/v1/c/${token}/ai/generate`)
      .send({ prompt: 'too late' });
    expect(res.status).toBe(409);
  });

  it('returns 404 polling a job that is not on this session', async () => {
    const seller = await seedSeller();
    const token = await newSessionToken(seller.token);
    const res = await api().get(`/api/v1/c/${token}/ai/jobs/64b7f0000000000000000000`);
    expect(res.status).toBe(404);
  });
});
