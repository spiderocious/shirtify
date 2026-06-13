import { z } from 'zod';

import { ShirtTypeSchema, SceneSchema } from './scene.js';

/**
 * Domain entities, Zod-defined. These are the canonical shapes the backend
 * parses Mongo documents into at the adapter boundary, and the frontend infers
 * its types from. One schema, both sides.
 */

export const SellerRole = z.enum(['seller', 'admin']);
export type SellerRole = z.infer<typeof SellerRole>;

/**
 * Onboarding stage. After email/password registration a seller is
 * AWAITING_BUSINESS_SUBMISSION and is forced through the (unskippable) store
 * setup page; once they submit business details they're BUSINESS_SUBMITTED and
 * can reach the dashboard. Shared enum — backend sets it, frontend routes on it.
 */
export const RegistrationStatus = z.enum([
  'AWAITING_BUSINESS_SUBMISSION',
  'BUSINESS_SUBMITTED',
]);
export type RegistrationStatus = z.infer<typeof RegistrationStatus>;

/**
 * A shirt base colour. Colours are data, not a hardcoded enum: platform colours
 * (scope 'platform', seeded defaults, available to everyone) plus per-seller
 * colours (scope 'seller', her own stock). `shirt_color` on a session must match
 * a colour id available to that session's seller (platform ∪ her own).
 */
export const ColorScope = z.enum(['platform', 'seller']);
export type ColorScope = z.infer<typeof ColorScope>;

export const ColorSchema = z.object({
  id: z.string(),
  scope: ColorScope,
  seller_id: z.string().nullable(),
  /** Stable slug used as `shirt_color` (e.g. "white", "lime"). */
  slug: z.string(),
  label: z.string(),
  hex: z.string(),
  created_at: z.string(),
});
export type Color = z.infer<typeof ColorSchema>;

export const BrandColors = z.object({
  primary: z.string(),
  accent: z.string(),
  ink: z.string(),
  surface: z.string(),
});
export type BrandColors = z.infer<typeof BrandColors>;

/**
 * A material the seller offers (tee, hoodie, or a custom one she uploads a photo
 * of). Built-in materials are seeded platform-wide; sellers add their own with an
 * uploaded image. The canvas shows `image_key` as the backdrop when present;
 * built-ins with no image fall back to the vector silhouette keyed by `slug`.
 */
export const MaterialScope = z.enum(['platform', 'seller']);
export type MaterialScope = z.infer<typeof MaterialScope>;

export const MaterialSchema = z.object({
  id: z.string(),
  scope: MaterialScope,
  seller_id: z.string().nullable(),
  slug: z.string(),
  label: z.string(),
  /** R2 key of the seller's uploaded photo; null for built-in vector materials. */
  image_key: z.string().nullable(),
  /** Built-in silhouette key (tee/hoodie/polo/oversized) when image_key is null. */
  builtin_shape: z.string().nullable(),
  created_at: z.string(),
});
export type Material = z.infer<typeof MaterialSchema>;

/** Storefront presentation config, set by the seller. */
export const StorefrontConfig = z.object({
  description: z.string().nullable(),
  /** Accent colour for the storefront page. */
  storefront_color: z.string().nullable(),
  /** Display font id (one of FONTS) for the storefront heading. */
  storefront_font: z.string().nullable(),
  /** Material slugs to show on the storefront; null = show all. */
  visible_materials: z.array(z.string()).nullable(),
});
export type StorefrontConfig = z.infer<typeof StorefrontConfig>;

/** Seller as exposed to authed seller surfaces (no password hash). */
export const SellerSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  business_name: z.string(),
  public_slug: z.string(),
  brand_logo_key: z.string().nullable(),
  brand_colors: BrandColors.nullable(),
  welcome_voice: z.string().nullable(),
  description: z.string().nullable(),
  storefront_color: z.string().nullable(),
  storefront_font: z.string().nullable(),
  visible_materials: z.array(z.string()).nullable(),
  registration_status: RegistrationStatus,
  role: SellerRole,
  created_at: z.string(), // ISO 8601
});
export type Seller = z.infer<typeof SellerSchema>;

/** Brand subset safe to expose on public customer/storefront pages. */
export const PublicBrandSchema = z.object({
  business_name: z.string(),
  public_slug: z.string(),
  brand_logo_key: z.string().nullable(),
  brand_colors: BrandColors.nullable(),
  welcome_voice: z.string().nullable(),
  description: z.string().nullable(),
  storefront_color: z.string().nullable(),
  storefront_font: z.string().nullable(),
});
export type PublicBrand = z.infer<typeof PublicBrandSchema>;

export const SessionKind = z.enum(['custom', 'public']);
export type SessionKind = z.infer<typeof SessionKind>;

export const SessionStatus = z.enum(['in_progress', 'submitted', 'archived']);
export type SessionStatus = z.infer<typeof SessionStatus>;

/** Whether a (submitted) session's design is featured on the storefront. */
export const SessionVisibility = z.enum(['private', 'public']);
export type SessionVisibility = z.infer<typeof SessionVisibility>;

export const SessionSchema = z.object({
  id: z.string(),
  seller_id: z.string(),
  kind: SessionKind,
  token: z.string(),
  customer_name: z.string().nullable(),
  shirt_type: ShirtTypeSchema,
  shirt_color: z.string(),
  /** Optional custom material (slug) the session uses instead of a built-in type. */
  material_slug: z.string().nullable(),
  allowed_colors: z.array(z.string()).nullable(),
  price_quoted: z.number().int().nullable(), // minor units (kobo/cents)
  notes: z.string().nullable(),
  status: SessionStatus,
  visibility: SessionVisibility,
  created_at: z.string(),
  last_activity_at: z.string(),
});
export type Session = z.infer<typeof SessionSchema>;

/** Session as exposed on the public customer page (no seller_id / notes leak). */
export const PublicSessionSchema = SessionSchema.pick({
  id: true,
  kind: true,
  token: true,
  customer_name: true,
  shirt_type: true,
  shirt_color: true,
  material_slug: true,
  allowed_colors: true,
  status: true,
});
export type PublicSession = z.infer<typeof PublicSessionSchema>;

export const DesignSchema = z.object({
  id: z.string(),
  session_id: z.string(),
  canvas_front: SceneSchema,
  canvas_back: SceneSchema,
  submitted_at: z.string().nullable(),
  export_keys: z.record(z.string()).nullable(), // { [presetOrSizeId]: storageKey }
  updated_at: z.string(),
});
export type Design = z.infer<typeof DesignSchema>;

export const AssetKind = z.enum(['upload', 'export', 'logo', 'ai', 'material']);
export type AssetKind = z.infer<typeof AssetKind>;

/**
 * A card shown on a seller's public storefront — either a bare material the
 * seller offers, or a public designed session (a ready-made design a customer
 * can clone and tweak). The customer clicks one → enters a name → designs.
 */
export const StorefrontItemSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('material'),
    slug: z.string(),
    label: z.string(),
    image_key: z.string().nullable(),
    builtin_shape: z.string().nullable(),
  }),
  z.object({
    kind: z.literal('design'),
    /** The public session's token — used to clone its design. */
    token: z.string(),
    label: z.string(),
    shirt_type: ShirtTypeSchema,
    shirt_color: z.string(),
    material_slug: z.string().nullable(),
    /** Front scene for a thumbnail preview (rendered client-side). */
    preview: SceneSchema,
  }),
]);
export type StorefrontItem = z.infer<typeof StorefrontItemSchema>;

export const AssetSchema = z.object({
  id: z.string(),
  seller_id: z.string().nullable(),
  session_id: z.string().nullable(),
  kind: AssetKind,
  storage_key: z.string(),
  mime: z.string(),
  width: z.number().int().nullable(),
  height: z.number().int().nullable(),
  bytes: z.number().int().nullable(),
  created_at: z.string(),
});
export type Asset = z.infer<typeof AssetSchema>;
