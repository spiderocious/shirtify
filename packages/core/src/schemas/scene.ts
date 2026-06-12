import { z } from 'zod';

import { SHIRT_TYPES } from '../constants/shirt.js';

/**
 * The canvas scene schema — the seam shared by the editor (`packages/canvas`),
 * autosave, and the server-side exporter. Deliberately our own minimal shape,
 * NOT raw Konva node dumps, so server replay is stable and versionable.
 *
 * Coordinates are normalized 0..1 of the print area, so the same scene renders
 * at any export size with no rescale math.
 */

export const ShirtTypeSchema = z.enum(SHIRT_TYPES);
export type ShirtType = z.infer<typeof ShirtTypeSchema>;

export const SceneSide = z.enum(['front', 'back']);
export type SceneSide = z.infer<typeof SceneSide>;

const BaseLayer = z.object({
  id: z.string().min(1),
  x: z.number(), // 0..1 normalized
  y: z.number(),
  scale: z.number().positive(),
  rotation: z.number(), // degrees
  opacity: z.number().min(0).max(1),
});

export const TextLayerSchema = BaseLayer.extend({
  kind: z.literal('text'),
  text: z.string(),
  font: z.string(),
  color: z.string(),
  stroke: z
    .object({
      color: z.string(),
      width: z.number().min(0),
    })
    .optional(),
  shadow: z.boolean().optional(),
});
export type TextLayer = z.infer<typeof TextLayerSchema>;

export const ImageLayerSchema = BaseLayer.extend({
  kind: z.literal('image'),
  /** R2 storage key (never an expiring view URL). */
  assetKey: z.string().min(1),
  /** 'ai' is reserved for the post-MVP AI layer; MVP only produces 'upload'. */
  source: z.enum(['upload', 'ai']),
});
export type ImageLayer = z.infer<typeof ImageLayerSchema>;

export const LayerSchema = z.discriminatedUnion('kind', [TextLayerSchema, ImageLayerSchema]);
export type Layer = z.infer<typeof LayerSchema>;

export const SceneSchema = z.object({
  version: z.literal(1),
  shirt: z.object({
    type: ShirtTypeSchema,
    color: z.string(),
  }),
  /** z-order = array order (last = top). */
  layers: z.array(LayerSchema),
});
export type Scene = z.infer<typeof SceneSchema>;

/** An empty scene for a freshly created design side. */
export const emptyScene = (type: ShirtType, color: string): Scene => ({
  version: 1,
  shirt: { type, color },
  layers: [],
});
