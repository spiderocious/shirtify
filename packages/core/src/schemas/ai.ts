import { z } from 'zod';

import { fontFamilyById } from '../constants/shirt.js';
import type { Scene, Layer } from './scene.js';

/**
 * AI design surface — shared, vendor-agnostic schemas.
 *
 * Three customer-facing actions, all funnelled through one async job:
 *   - generate : prompt (+ scene context)            → N image options
 *   - edit     : a layer's image + an instruction     → N replacement images
 *   - tryon    : a person photo + a canvas snapshot   → the shirt "worn"
 *
 * These describe the *wire* (what the browser sends / polls) and the *job*
 * (what the backend stores). The provider port (backend) consumes a derived
 * request shape — see `ImageRequest` there — so swapping the image vendor never
 * touches these schemas or the routes.
 */

export const AiActionKind = z.enum(['generate', 'edit', 'tryon']);
export type AiActionKind = z.infer<typeof AiActionKind>;

export const AiJobStatus = z.enum(['pending', 'running', 'done', 'failed']);
export type AiJobStatus = z.infer<typeof AiJobStatus>;

/** Max prompt length — keeps wrapped vendor prompts well within model limits. */
export const AI_PROMPT_MAX = 1000;

/** How many options generate/edit return. PRD: three option cards. */
export const AI_OPTION_COUNT = 3;

/**
 * Structured description of what's currently on the shirt. Sent alongside the
 * prompt so the model has hard facts (not just the rendered pixels). Built from
 * the live Scene on the client; treated as untrusted context on the server.
 */
export const SceneContext = z.object({
  shirt_type: z.string(),
  shirt_color: z.string(),
  /** Plain-language summary of layers, e.g. `text "LAGOS" (Anton, #16140F, centre)`. */
  layers: z.array(z.string()).max(50).default([]),
});
export type SceneContext = z.infer<typeof SceneContext>;

/** A data-URL PNG snapshot of the canvas (or an uploaded photo). */
const dataUrl = z
  .string()
  .min(1)
  .max(12_000_000) // ~9MB of base64; generous for a canvas/photo PNG
  .regex(/^data:image\/(png|jpeg|webp);base64,/, 'expected a base64 image data URL');

// ---- Wire bodies (browser → backend) ----------------------------------------

export const AiGenerateBody = z.object({
  prompt: z.string().min(1).max(AI_PROMPT_MAX),
  scene: SceneContext.optional(),
});
export type AiGenerateBody = z.infer<typeof AiGenerateBody>;

export const AiEditBody = z.object({
  /** The layer being edited (its id is echoed back so the client can replace it). */
  layer_id: z.string().min(1),
  /** R2 key of the layer's current image (the base to regenerate from). */
  base_storage_key: z.string().min(1),
  /** The edit instruction, e.g. "make this bolder", "change to coral". */
  instruction: z.string().min(1).max(AI_PROMPT_MAX),
  scene: SceneContext.optional(),
});
export type AiEditBody = z.infer<typeof AiEditBody>;

export const AiTryOnBody = z.object({
  /** A photo of the person, as a base64 image data URL. */
  person_image: dataUrl,
  /** A PNG snapshot of the current canvas (the shirt + design), as a data URL. */
  design_snapshot: dataUrl,
  scene: SceneContext.optional(),
  /** Optional extra direction, e.g. "standing outdoors, natural light". */
  note: z.string().max(AI_PROMPT_MAX).optional(),
});
export type AiTryOnBody = z.infer<typeof AiTryOnBody>;

// ---- Job (backend → browser, polled) ----------------------------------------

/** One produced image option, ready to drop onto the canvas. */
export const AiResultImage = z.object({
  storage_key: z.string(),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
});
export type AiResultImage = z.infer<typeof AiResultImage>;

export const AiJobSchema = z.object({
  id: z.string(),
  session_id: z.string(),
  kind: AiActionKind,
  status: AiJobStatus,
  /** Populated when status === 'done'. */
  results: z.array(AiResultImage).default([]),
  /** For edit jobs: echoes the layer the client should replace. */
  layer_id: z.string().nullable(),
  /** Human-readable failure reason when status === 'failed'. */
  error: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type AiJob = z.infer<typeof AiJobSchema>;

/** Async accept: every action returns the freshly-created job (status pending). */
export const AiJobResponse = z.object({ job: AiJobSchema });
export type AiJobResponse = z.infer<typeof AiJobResponse>;

// ---- Scene → context helper -------------------------------------------------

const fmtFill = (fill: unknown): string =>
  typeof fill === 'string' ? fill : 'gradient';

const pos = (x: number, y: number): string => {
  const h = x < 0.34 ? 'left' : x > 0.66 ? 'right' : 'centre';
  const v = y < 0.34 ? 'top' : y > 0.66 ? 'bottom' : 'middle';
  return v === 'middle' && h === 'centre' ? 'centre' : `${v}-${h}`;
};

const describeLayer = (layer: Layer): string => {
  switch (layer.kind) {
    case 'text':
      return `text "${layer.text}" (${fontFamilyById(layer.font)}, ${fmtFill(layer.color)}, ${pos(layer.x, layer.y)})`;
    case 'graphic':
      return `icon "${layer.iconId}" (${fmtFill(layer.color)}, ${pos(layer.x, layer.y)})`;
    case 'shape':
      return `${layer.shape} shape (${fmtFill(layer.fill)}, ${pos(layer.x, layer.y)})`;
    case 'image':
      return `image (${pos(layer.x, layer.y)})`;
    default:
      return 'layer';
  }
};

/**
 * Summarise a live Scene into the hard-fact context the model receives next to
 * the prompt. Pure — usable on client (to build the request) and server (to
 * re-derive / validate).
 */
export const buildSceneContext = (scene: Scene): SceneContext => ({
  shirt_type: scene.shirt.type,
  shirt_color: scene.shirt.color,
  layers: scene.layers.slice(0, 50).map(describeLayer),
});
