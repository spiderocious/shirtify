import { z } from 'zod';

import { SHIRT_TYPES } from '../constants/shirt.js';

/**
 * The canvas scene schema — the seam shared by the editor (`packages/canvas`),
 * autosave, and the server-side exporter. Deliberately our own minimal shape,
 * NOT raw Konva node dumps, so server replay is stable and versionable.
 *
 * Coordinates are normalized 0..1 of the print area, so the same scene renders
 * at any export size with no rescale math.
 *
 * v2 adds: shape layers, gradient fills (text + shapes), per-layer & whole-scene
 * filters, and a per-seller material reference. v1 scenes still load (the version
 * field accepts 1 or 2 and the new fields are all optional).
 */

export const ShirtTypeSchema = z.enum(SHIRT_TYPES);
export type ShirtType = z.infer<typeof ShirtTypeSchema>;

export const SceneSide = z.enum(['front', 'back']);
export type SceneSide = z.infer<typeof SceneSide>;

// ---- Fills (solid or gradient), shared by text + shapes ----
export const GradientSchema = z.object({
  type: z.literal('linear'),
  /** 2+ colour stops, each 0..1 position. */
  stops: z.array(z.object({ offset: z.number().min(0).max(1), color: z.string() })).min(2),
  /** Gradient angle in degrees. */
  angle: z.number().default(0),
});
export type Gradient = z.infer<typeof GradientSchema>;

/** A fill is either a solid colour string or a gradient. */
export const FillSchema = z.union([z.string(), GradientSchema]);
export type Fill = z.infer<typeof FillSchema>;

// ---- Filters, shared by image layers + the whole scene ----
export const FILTER_KINDS = [
  'none',
  'grayscale',
  'sepia',
  'invert',
  'vintage',
  'cool',
  'warm',
  'noir',
] as const;
export const FilterSchema = z.enum(FILTER_KINDS);
export type FilterKind = z.infer<typeof FilterSchema>;

// ---- Shapes ----
export const SHAPE_KINDS = [
  'rect',
  'rounded-rect',
  'circle',
  'ellipse',
  'triangle',
  'star',
  'pentagon',
  'hexagon',
  'diamond',
  'heart',
  'arrow',
  'line',
  'cross',
  'burst',
] as const;
export const ShapeKindSchema = z.enum(SHAPE_KINDS);
export type ShapeKind = z.infer<typeof ShapeKindSchema>;

const BaseLayer = z.object({
  id: z.string().min(1),
  x: z.number(), // 0..1 normalized (centre)
  y: z.number(),
  scale: z.number().positive(),
  rotation: z.number(), // degrees
  opacity: z.number().min(0).max(1),
});

export const TextLayerSchema = BaseLayer.extend({
  kind: z.literal('text'),
  text: z.string(),
  font: z.string(),
  /** Solid colour or gradient (multi-colour text). */
  color: FillSchema,
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
  /** Per-image filter. */
  filter: FilterSchema.optional(),
});
export type ImageLayer = z.infer<typeof ImageLayerSchema>;

export const ShapeLayerSchema = BaseLayer.extend({
  kind: z.literal('shape'),
  shape: ShapeKindSchema,
  /** Fill colour or gradient. */
  fill: FillSchema,
  stroke: z
    .object({
      color: z.string(),
      width: z.number().min(0),
    })
    .optional(),
  /** Base size as a fraction of the print area (before `scale`). */
  size: z.number().positive().default(0.25),
  /** Points for polygon/star shapes (where applicable). */
  sides: z.number().int().min(3).max(20).optional(),
});
export type ShapeLayer = z.infer<typeof ShapeLayerSchema>;

export const LayerSchema = z.discriminatedUnion('kind', [
  TextLayerSchema,
  ImageLayerSchema,
  ShapeLayerSchema,
]);
export type Layer = z.infer<typeof LayerSchema>;

export const SceneSchema = z.object({
  // Accept v1 and v2; the editor always writes 2.
  version: z.union([z.literal(1), z.literal(2)]),
  shirt: z.object({
    type: ShirtTypeSchema,
    color: z.string(),
    /** Per-seller custom material (R2 image backdrop). When set, the canvas
     *  shows this image instead of the built-in vector silhouette. */
    materialId: z.string().optional(),
    materialImageKey: z.string().optional(),
  }),
  /** A filter applied to the whole composition. */
  filter: FilterSchema.optional(),
  /** z-order = array order (last = top). */
  layers: z.array(LayerSchema),
});
export type Scene = z.infer<typeof SceneSchema>;

/** An empty scene for a freshly created design side. */
export const emptyScene = (type: ShirtType, color: string): Scene => ({
  version: 2,
  shirt: { type, color },
  layers: [],
});
