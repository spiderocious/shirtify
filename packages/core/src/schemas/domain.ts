import { z } from 'zod';

import { ShirtTypeSchema, SceneSchema } from './scene.js';

/**
 * Domain entities, Zod-defined. These are the canonical shapes the backend
 * parses Mongo documents into at the adapter boundary, and the frontend infers
 * its types from. One schema, both sides.
 */

export const SellerRole = z.enum(['seller', 'admin']);
export type SellerRole = z.infer<typeof SellerRole>;

export const BrandColors = z.object({
  primary: z.string(),
  accent: z.string(),
  ink: z.string(),
  surface: z.string(),
});
export type BrandColors = z.infer<typeof BrandColors>;

/** Seller as exposed to authed seller surfaces (no password hash). */
export const SellerSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  business_name: z.string(),
  public_slug: z.string(),
  brand_logo_key: z.string().nullable(),
  brand_colors: BrandColors.nullable(),
  welcome_voice: z.string().nullable(),
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
});
export type PublicBrand = z.infer<typeof PublicBrandSchema>;

export const SessionKind = z.enum(['custom', 'public']);
export type SessionKind = z.infer<typeof SessionKind>;

export const SessionStatus = z.enum(['in_progress', 'submitted', 'archived']);
export type SessionStatus = z.infer<typeof SessionStatus>;

export const SessionSchema = z.object({
  id: z.string(),
  seller_id: z.string(),
  kind: SessionKind,
  token: z.string(),
  customer_name: z.string().nullable(),
  shirt_type: ShirtTypeSchema,
  shirt_color: z.string(),
  allowed_colors: z.array(z.string()).nullable(),
  price_quoted: z.number().int().nullable(), // minor units (kobo/cents)
  notes: z.string().nullable(),
  status: SessionStatus,
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

export const AssetKind = z.enum(['upload', 'export', 'logo', 'ai']);
export type AssetKind = z.infer<typeof AssetKind>;

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
