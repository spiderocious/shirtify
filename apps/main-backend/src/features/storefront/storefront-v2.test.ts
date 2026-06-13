import { SellerSchema, StorefrontResponse, emptyScene } from '@shirtify/core';
import { describe, it, expect } from 'vitest';

import { api, seedSeller, bearer } from '../../test/helpers.js';

describe('registration status + storefront items + clone', () => {
  it('new sellers start AWAITING_BUSINESS_SUBMISSION; submitting business advances status', async () => {
    const seller = await seedSeller();
    const me = await api().get('/api/v1/me').set(...bearer(seller.token));
    expect(SellerSchema.parse(me.body.data.seller).registration_status).toBe(
      'AWAITING_BUSINESS_SUBMISSION',
    );

    const res = await api()
      .patch('/api/v1/me/business')
      .set(...bearer(seller.token))
      .send({ business_name: 'Aba Threads', description: 'Custom shirts', storefront_color: '#1f6bff' });
    expect(res.status).toBe(200);
    expect(res.body.data.seller.registration_status).toBe('BUSINESS_SUBMITTED');
    expect(res.body.data.seller.business_name).toBe('Aba Threads');
  });

  it('a submitted session can be made public and shows as a storefront design item', async () => {
    const seller = await seedSeller();
    // create + design + submit
    const created = await api()
      .post('/api/v1/sessions')
      .set(...bearer(seller.token))
      .send({ shirt_type: 'tee', shirt_color: 'white' });
    const id = created.body.data.session.id as string;
    const token = created.body.data.session.token as string;

    const scene = emptyScene('tee', 'white');
    scene.layers.push({
      id: 'l1', kind: 'text', x: 0.5, y: 0.5, scale: 1, rotation: 0, opacity: 1,
      text: 'PUBLIC', font: 'archivo-black', color: '#000000',
    });
    await api().put(`/api/v1/c/${token}/design`).send({ canvas_front: scene, canvas_back: emptyScene('tee', 'white') });
    await api().post(`/api/v1/c/${token}/submit`).send({});

    // make public
    const vis = await api().patch(`/api/v1/sessions/${id}`).set(...bearer(seller.token)).send({ visibility: 'public' });
    expect(vis.status).toBe(200);
    expect(vis.body.data.session.visibility).toBe('public');

    // storefront now lists it as a design item
    const sf = await api().get(`/api/v1/s/${seller.slug}`);
    const data = StorefrontResponse.parse(sf.body.data);
    const designItem = data.items.find((i) => i.kind === 'design');
    expect(designItem).toBeDefined();
    if (designItem?.kind === 'design') {
      expect(designItem.token).toBe(token);
      expect(designItem.preview.layers.length).toBe(1);
    }
  });

  it('storefront "use this design" clones the public design into a new session', async () => {
    const seller = await seedSeller();
    const created = await api()
      .post('/api/v1/sessions')
      .set(...bearer(seller.token))
      .send({ shirt_type: 'tee', shirt_color: 'white' });
    const srcToken = created.body.data.session.token as string;
    const srcId = created.body.data.session.id as string;

    const scene = emptyScene('tee', 'white');
    scene.layers.push({
      id: 'l1', kind: 'shape', shape: 'star', x: 0.5, y: 0.4, scale: 1, rotation: 0,
      opacity: 1, fill: '#FFD24A', size: 0.3,
    });
    await api().put(`/api/v1/c/${srcToken}/design`).send({ canvas_front: scene, canvas_back: emptyScene('tee', 'white') });
    await api().post(`/api/v1/c/${srcToken}/submit`).send({});
    await api().patch(`/api/v1/sessions/${srcId}`).set(...bearer(seller.token)).send({ visibility: 'public' });

    // Customer clones it from the storefront.
    const start = await api()
      .post(`/api/v1/s/${seller.slug}/start`)
      .send({ shirt_type: 'tee', shirt_color: 'white', customer_name: 'Ada', from_token: srcToken });
    expect(start.status).toBe(201);
    const newToken = start.body.data.token as string;
    expect(newToken).not.toBe(srcToken);

    const open = await api().get(`/api/v1/c/${newToken}`);
    expect(open.status).toBe(200);
    expect(open.body.data.design.canvas_front.layers).toHaveLength(1);
    expect(open.body.data.design.canvas_front.layers[0].kind).toBe('shape');
    expect(open.body.data.session.customer_name).toBe('Ada');
  });
});
