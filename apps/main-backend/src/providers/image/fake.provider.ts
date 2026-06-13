import { createCanvas } from '@napi-rs/canvas';

import type {
  EditRequest,
  GenerateRequest,
  GeneratedImage,
  ImageProvider,
  TryOnRequest,
} from './ports.js';

/**
 * Deterministic, offline image provider. Produces real PNGs (so the full
 * upload→asset→layer pipeline exercises end-to-end) without a key, network, or
 * spend. The default in development and tests; the OpenAI adapter takes over
 * only when a key is configured.
 */

const SIZE = 512;
const SWATCHES = ['#C6F24E', '#1F6BFF', '#FF5252', '#16140F', '#FBF7EC'];

const png = (label: string, idx: number): GeneratedImage => {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = SWATCHES[idx % SWATCHES.length] ?? '#C6F24E';
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = idx % SWATCHES.length === 3 ? '#FBF7EC' : '#16140F';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('AI (mock)', SIZE / 2, SIZE / 2 - 16);
  ctx.font = '18px sans-serif';
  ctx.fillText(label.slice(0, 40), SIZE / 2, SIZE / 2 + 20);
  ctx.fillText(`option ${idx + 1}`, SIZE / 2, SIZE / 2 + 48);
  return { data: canvas.toBuffer('image/png'), mime: 'image/png', width: SIZE, height: SIZE };
};

const make = (label: string, count: number): GeneratedImage[] =>
  Array.from({ length: Math.max(1, count) }, (_, i) => png(label, i));

export const createFakeImageProvider = (): ImageProvider => ({
  id: 'fake',
  capabilities: { generate: true, edit: true, tryon: true },
  async generate(req: GenerateRequest) {
    return make(req.prompt, req.count);
  },
  async edit(req: EditRequest) {
    return make(req.instruction, req.count);
  },
  async tryOn(req: TryOnRequest) {
    return make(req.note ?? 'try-on', req.count);
  },
});
