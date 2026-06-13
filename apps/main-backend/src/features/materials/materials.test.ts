import { MaterialSchema, SellerSchema, emptyScene } from '@shirtify/core';
import { describe, it, expect } from 'vitest';

import { api, seedSeller, bearer } from '../../test/helpers.js';

describe('materials + brand + session edits + scene v2', () => {
  it('lists the 4 seeded platform materials', async () => {
    const seller = await seedSeller();
    const res = await api().get('/api/v1/materials').set(...bearer(seller.token));
    expect(res.status).toBe(200);
    const materials = res.body.data.materials.map((m: unknown) => MaterialSchema.parse(m));
    const platform = materials.filter((m: { scope: string }) => m.scope === 'platform');
    expect(platform.length).toBe(4);
    expect(platform.map((m: { slug: string }) => m.slug)).toContain('hoodie');
  });

  it('lets a seller add a custom material and use it on a session', async () => {
    const seller = await seedSeller();
    const add = await api()
      .post('/api/v1/materials')
      .set(...bearer(seller.token))
      .send({ label: 'Vintage Denim', image_key: 'denim.png' });
    expect(add.status).toBe(201);
    expect(add.body.data.material.slug).toBe('vintage-denim');
    expect(add.body.data.material.image_key).toBe('denim.png');

    const session = await api()
      .post('/api/v1/sessions')
      .set(...bearer(seller.token))
      .send({ shirt_type: 'tee', shirt_color: 'white', material_slug: 'vintage-denim' });
    expect(session.status).toBe(201);
    expect(session.body.data.session.material_slug).toBe('vintage-denim');
  });

  it('rejects a session with an unknown material (400)', async () => {
    const seller = await seedSeller();
    const res = await api()
      .post('/api/v1/sessions')
      .set(...bearer(seller.token))
      .send({ shirt_type: 'tee', shirt_color: 'white', material_slug: 'nope' });
    expect(res.status).toBe(400);
    expect(res.body.error.field_errors.material_slug).toBeDefined();
  });

  it('cannot delete a platform material (404), can delete own', async () => {
    const seller = await seedSeller();
    const list = await api().get('/api/v1/materials').set(...bearer(seller.token));
    const platform = list.body.data.materials.find((m: { scope: string }) => m.scope === 'platform');
    const delPlatform = await api()
      .delete(`/api/v1/materials/${platform.id}`)
      .set(...bearer(seller.token));
    expect(delPlatform.status).toBe(404);

    const add = await api()
      .post('/api/v1/materials')
      .set(...bearer(seller.token))
      .send({ label: 'Mine', image_key: 'm.png' });
    const delMine = await api()
      .delete(`/api/v1/materials/${add.body.data.material.id}`)
      .set(...bearer(seller.token));
    expect(delMine.status).toBe(204);
  });

  it('updates brand/storefront config via PATCH /me/brand', async () => {
    const seller = await seedSeller();
    const res = await api()
      .patch('/api/v1/me/brand')
      .set(...bearer(seller.token))
      .send({
        business_name: 'Lagos Threads',
        description: 'Owambe-ready custom shirts.',
        storefront_color: '#1f6bff',
        storefront_font: 'bebas-neue',
        visible_materials: ['tee', 'hoodie'],
      });
    expect(res.status).toBe(200);
    const updated = SellerSchema.parse(res.body.data.seller);
    expect(updated.business_name).toBe('Lagos Threads');
    expect(updated.storefront_color).toBe('#1f6bff');
    expect(updated.visible_materials).toEqual(['tee', 'hoodie']);

    // The storefront reflects the config + filters materials.
    const sf = await api().get(`/api/v1/s/${updated.public_slug}`);
    expect(sf.body.data.brand.description).toBe('Owambe-ready custom shirts.');
    expect(sf.body.data.brand.storefront_color).toBe('#1f6bff');
    expect(sf.body.data.materials.map((m: { slug: string }) => m.slug).sort()).toEqual([
      'hoodie',
      'tee',
    ]);
  });

  it('edits a session shirt type + colour after creation, mirrors into the design', async () => {
    const seller = await seedSeller();
    const created = await api()
      .post('/api/v1/sessions')
      .set(...bearer(seller.token))
      .send({ shirt_type: 'tee', shirt_color: 'white' });
    const id = created.body.data.session.id as string;

    const res = await api()
      .patch(`/api/v1/sessions/${id}`)
      .set(...bearer(seller.token))
      .send({ shirt_type: 'hoodie', shirt_color: 'black' });
    expect(res.status).toBe(200);
    expect(res.body.data.session.shirt_type).toBe('hoodie');
    expect(res.body.data.session.shirt_color).toBe('black');

    // The design scene's shirt mirrors the edit.
    const detail = await api().get(`/api/v1/sessions/${id}`).set(...bearer(seller.token));
    expect(detail.body.data.design.canvas_front.shirt.type).toBe('hoodie');
    expect(detail.body.data.design.canvas_front.shirt.color).toBe('black');
  });

  it('rejects editing a session to an unknown colour (400)', async () => {
    const seller = await seedSeller();
    const created = await api()
      .post('/api/v1/sessions')
      .set(...bearer(seller.token))
      .send({ shirt_type: 'tee', shirt_color: 'white' });
    const id = created.body.data.session.id as string;
    const res = await api()
      .patch(`/api/v1/sessions/${id}`)
      .set(...bearer(seller.token))
      .send({ shirt_color: 'chartreuse' });
    expect(res.status).toBe(400);
  });

  it('accepts and round-trips a v2 scene (shapes, gradient text, filters) via autosave', async () => {
    const seller = await seedSeller();
    const created = await api()
      .post('/api/v1/sessions')
      .set(...bearer(seller.token))
      .send({ shirt_type: 'tee', shirt_color: 'white' });
    const token = created.body.data.session.token as string;

    const scene = emptyScene('tee', 'white');
    scene.filter = 'sepia';
    scene.layers.push({
      id: 's1',
      kind: 'shape',
      shape: 'star',
      x: 0.5,
      y: 0.4,
      scale: 1,
      rotation: 0,
      opacity: 1,
      fill: { type: 'linear', stops: [
        { offset: 0, color: '#ff0000' },
        { offset: 1, color: '#0000ff' },
      ], angle: 45 },
      size: 0.3,
    });
    scene.layers.push({
      id: 't1',
      kind: 'text',
      x: 0.5,
      y: 0.7,
      scale: 1,
      rotation: 0,
      opacity: 1,
      text: 'RAINBOW',
      font: 'archivo-black',
      color: { type: 'linear', stops: [
        { offset: 0, color: '#ff0000' },
        { offset: 0.5, color: '#00ff00' },
        { offset: 1, color: '#0000ff' },
      ], angle: 0 },
    });

    const save = await api()
      .put(`/api/v1/c/${token}/design`)
      .send({ canvas_front: scene, canvas_back: emptyScene('tee', 'white') });
    expect(save.status).toBe(200);
    const front = save.body.data.design.canvas_front;
    expect(front.version).toBe(2);
    expect(front.filter).toBe('sepia');
    expect(front.layers).toHaveLength(2);
    expect(front.layers[0].kind).toBe('shape');
    expect(front.layers[1].color.type).toBe('linear');
  });
});
