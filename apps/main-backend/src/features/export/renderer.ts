import { createCanvas, loadImage, type SKRSContext2D } from '@napi-rs/canvas';

import {
  fontFamilyById,
  type Scene,
  type Layer,
  type Fill,
  type FilterKind,
  type ShapeKind,
} from '@shirtify/core';

import { logger } from '@lib/logger.js';

/**
 * Server-side scene renderer (export parity with the browser canvas). Reads the
 * shared v2 `Scene` schema and composites it to a transparent PNG at any target
 * size: text (solid or gradient fill), images (with per-layer filters), shapes
 * (many kinds, gradient-capable), a whole-scene filter, and a custom-material
 * image backdrop. Coordinates are normalized 0..1 of the print area.
 */

export interface RenderTarget {
  width: number;
  height: number;
}

type Ctx = SKRSContext2D;

// ---- Fills (solid or gradient) ----
const applyFill = (ctx: Ctx, fill: Fill, w: number, h: number): string | ReturnType<Ctx['createLinearGradient']> => {
  if (typeof fill === 'string') return fill;
  const rad = (fill.angle * Math.PI) / 180;
  const x = Math.cos(rad);
  const y = Math.sin(rad);
  const grad = ctx.createLinearGradient((-x * w) / 2, (-y * h) / 2, (x * w) / 2, (y * h) / 2);
  for (const stop of fill.stops) grad.addColorStop(stop.offset, stop.color);
  return grad;
};

// ---- Filters (pixel pass over a region) ----
const filterPixels = (ctx: Ctx, filter: FilterKind, x: number, y: number, w: number, h: number): void => {
  if (filter === 'none') return;
  const iw = Math.max(1, Math.round(w));
  const ih = Math.max(1, Math.round(h));
  const ix = Math.round(x);
  const iy = Math.round(y);
  const img = ctx.getImageData(ix, iy, iw, ih);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i]!;
    const g = d[i + 1]!;
    const b = d[i + 2]!;
    switch (filter) {
      case 'grayscale':
      case 'noir': {
        const v = 0.299 * r + 0.587 * g + 0.114 * b;
        d[i] = d[i + 1] = d[i + 2] = filter === 'noir' ? (v > 128 ? 255 : v * 0.6) : v;
        break;
      }
      case 'sepia':
      case 'vintage': {
        d[i] = Math.min(255, 0.393 * r + 0.769 * g + 0.189 * b);
        d[i + 1] = Math.min(255, 0.349 * r + 0.686 * g + 0.168 * b);
        d[i + 2] = Math.min(255, 0.272 * r + 0.534 * g + 0.131 * b);
        break;
      }
      case 'invert':
        d[i] = 255 - r;
        d[i + 1] = 255 - g;
        d[i + 2] = 255 - b;
        break;
      case 'cool':
        d[i + 2] = Math.min(255, b + 30);
        d[i] = Math.max(0, r - 15);
        break;
      case 'warm':
        d[i] = Math.min(255, r + 30);
        d[i + 2] = Math.max(0, b - 15);
        break;
      default:
        break;
    }
  }
  ctx.putImageData(img, ix, iy);
};

// ---- Shape paths ----
const polygonPath = (ctx: Ctx, sides: number, r: number): void => {
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2 - Math.PI / 2;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
};

const starPath = (ctx: Ctx, points: number, outer: number, inner: number): void => {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
};

const heartPath = (ctx: Ctx, s: number): void => {
  const r = s / 2;
  ctx.beginPath();
  ctx.moveTo(0, r * 0.35);
  ctx.bezierCurveTo(0, 0, -r, 0, -r, -r * 0.5);
  ctx.bezierCurveTo(-r, -r, 0, -r, 0, -r * 0.35);
  ctx.bezierCurveTo(0, -r, r, -r, r, -r * 0.5);
  ctx.bezierCurveTo(r, 0, 0, 0, 0, r * 0.35);
  ctx.closePath();
};

const drawShapePath = (ctx: Ctx, shape: ShapeKind, size: number, sides = 6): void => {
  const r = size / 2;
  switch (shape) {
    case 'rect':
      ctx.beginPath();
      ctx.rect(-r, -r, size, size);
      break;
    case 'rounded-rect': {
      const rad = size * 0.15;
      ctx.beginPath();
      ctx.roundRect(-r, -r, size, size, rad);
      break;
    }
    case 'circle':
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      break;
    case 'ellipse':
      ctx.beginPath();
      ctx.ellipse(0, 0, r, r * 0.65, 0, 0, Math.PI * 2);
      break;
    case 'triangle':
      polygonPath(ctx, 3, r);
      break;
    case 'pentagon':
      polygonPath(ctx, 5, r);
      break;
    case 'hexagon':
      polygonPath(ctx, 6, r);
      break;
    case 'diamond':
      polygonPath(ctx, 4, r);
      break;
    case 'star':
      starPath(ctx, 5, r, r * 0.45);
      break;
    case 'burst':
      starPath(ctx, 12, r, r * 0.7);
      break;
    case 'heart':
      heartPath(ctx, size);
      break;
    case 'cross':
      ctx.beginPath();
      ctx.rect(-r * 0.33, -r, size * 0.33, size);
      ctx.rect(-r, -r * 0.33, size, size * 0.33);
      break;
    case 'arrow':
      ctx.beginPath();
      ctx.moveTo(-r, -r * 0.3);
      ctx.lineTo(r * 0.2, -r * 0.3);
      ctx.lineTo(r * 0.2, -r * 0.6);
      ctx.lineTo(r, 0);
      ctx.lineTo(r * 0.2, r * 0.6);
      ctx.lineTo(r * 0.2, r * 0.3);
      ctx.lineTo(-r, r * 0.3);
      ctx.closePath();
      break;
    case 'line':
      ctx.beginPath();
      ctx.rect(-r, -size * 0.04, size, size * 0.08);
      break;
    default:
      polygonPath(ctx, sides, r);
  }
};

const drawLayer = async (
  ctx: Ctx,
  layer: Layer,
  target: RenderTarget,
  resolveAssetUrl: (key: string) => Promise<string>,
): Promise<void> => {
  const px = layer.x * target.width;
  const py = layer.y * target.height;

  ctx.save();
  ctx.globalAlpha = layer.opacity;
  ctx.translate(px, py);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.scale(layer.scale, layer.scale);

  if (layer.kind === 'text') {
    const size = target.height * 0.06;
    ctx.font = `700 ${size}px "${fontFamilyById(layer.font)}"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const metrics = ctx.measureText(layer.text || ' ');
    if (layer.stroke && layer.stroke.width > 0) {
      ctx.strokeStyle = layer.stroke.color;
      ctx.lineWidth = layer.stroke.width;
      ctx.strokeText(layer.text, 0, 0);
    }
    ctx.fillStyle = applyFill(ctx, layer.color, metrics.width || size, size);
    ctx.fillText(layer.text, 0, 0);
  } else if (layer.kind === 'shape') {
    const s = (layer.size ?? 0.25) * target.width;
    drawShapePath(ctx, layer.shape, s, layer.sides);
    ctx.fillStyle = applyFill(ctx, layer.fill, s, s);
    ctx.fill();
    if (layer.stroke && layer.stroke.width > 0) {
      ctx.strokeStyle = layer.stroke.color;
      ctx.lineWidth = layer.stroke.width;
      ctx.stroke();
    }
  } else {
    try {
      const url = await resolveAssetUrl(layer.assetKey);
      const img = await loadImage(url);
      const base = target.width * 0.4;
      const ratio = img.height / img.width;
      const w = base;
      const h = base * ratio;
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      // Per-image filter: applied to the layer's bounding box (post-transform is
      // hard with getImageData, so we apply in screen space after restore).
      if (layer.filter && layer.filter !== 'none') {
        ctx.restore();
        // Re-derive an axis-aligned box around the placement to filter.
        const bw = w * layer.scale;
        const bh = h * layer.scale;
        filterPixels(ctx, layer.filter, px - bw / 2, py - bh / 2, bw, bh);
        return;
      }
    } catch (err) {
      logger.warn({ err, key: layer.assetKey }, 'export: failed to load image layer');
    }
  }

  ctx.restore();
};

/** Render a scene to a transparent PNG buffer at the target size. */
export const renderSceneToPng = async (
  scene: Scene,
  target: RenderTarget,
  resolveAssetUrl: (key: string) => Promise<string>,
): Promise<Buffer> => {
  const canvas = createCanvas(target.width, target.height);
  const ctx = canvas.getContext('2d');

  // Custom material backdrop (uploaded photo). Built-in materials export with a
  // transparent backdrop (the design is what prints, not the shirt silhouette).
  if (scene.shirt.materialImageKey) {
    try {
      const url = await resolveAssetUrl(scene.shirt.materialImageKey);
      const img = await loadImage(url);
      ctx.drawImage(img, 0, 0, target.width, target.height);
    } catch (err) {
      logger.warn({ err }, 'export: failed to load material backdrop');
    }
  }

  for (const layer of scene.layers) {

    await drawLayer(ctx, layer, target, resolveAssetUrl);
  }

  // Whole-scene filter over the full canvas.
  if (scene.filter && scene.filter !== 'none') {
    filterPixels(ctx, scene.filter, 0, 0, target.width, target.height);
  }

  return canvas.toBuffer('image/png');
};
