import { createCanvas, loadImage } from '@napi-rs/canvas';

import { FONTS, type Scene, type Layer } from '@shirtify/core';

import { logger } from '@lib/logger.js';

/**
 * Server-side scene renderer. Reads the shared `Scene` schema (the same JSON the
 * browser canvas autosaves) and composites it to a transparent PNG at any target
 * size. Coordinates are normalized 0..1 of the print area, so this maps them to
 * the target pixel box — no rescale math, matching the client editor.
 *
 * This is the export-side twin of the future client Konva renderer; both consume
 * the one Scene schema.
 */

export interface RenderTarget {
  width: number;
  height: number;
}

// Map a font id to a renderable family name (fonts must be registered, below).
const fontFamily = (id: string): string => {
  const f = FONTS.find((x) => x.id === id);
  return f ? f.label : 'sans-serif';
};

let fontsReady = false;
/** Register bundled fonts once. In dev without font files this is a no-op and
 *  the renderer falls back to the system sans-serif. */
const ensureFonts = (): void => {
  if (fontsReady) return;
  try {
    // GlobalFonts.registerFromPath(path, family) — wire real font files here in
    // a later pass; for MVP we rely on system fonts the OS provides.
    fontsReady = true;
  } catch (err) {
    logger.warn({ err }, 'font registration failed; using system fallback');
    fontsReady = true;
  }
};

const drawLayer = async (
  ctx: ReturnType<ReturnType<typeof createCanvas>['getContext']>,
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
    // Base font size relative to target; scaled by the layer transform above.
    const size = target.height * 0.06;
    ctx.font = `700 ${size}px "${fontFamily(layer.font)}"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (layer.stroke && layer.stroke.width > 0) {
      ctx.strokeStyle = layer.stroke.color;
      ctx.lineWidth = layer.stroke.width;
      ctx.strokeText(layer.text, 0, 0);
    }
    ctx.fillStyle = layer.color;
    ctx.fillText(layer.text, 0, 0);
  } else {
    try {
      const url = await resolveAssetUrl(layer.assetKey);
      const img = await loadImage(url);
      // Draw image centred on the layer origin at a target-relative base size.
      const base = target.width * 0.4;
      const ratio = img.height / img.width;
      const w = base;
      const h = base * ratio;
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
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
  ensureFonts();
  const canvas = createCanvas(target.width, target.height);
  const ctx = canvas.getContext('2d');

  // Transparent background: do NOT fill. Layers paint in z-order (array order).
  for (const layer of scene.layers) {
     
    await drawLayer(ctx, layer, target, resolveAssetUrl);
  }

  return canvas.toBuffer('image/png');
};
