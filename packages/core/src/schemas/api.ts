import { z } from 'zod';

import { EXPORT_PRESET_IDS } from '../constants/shirt.js';
import {
  SellerSchema,
  SessionSchema,
  DesignSchema,
  PublicSessionSchema,
  PublicBrandSchema,
  MaterialSchema,
  StorefrontItemSchema,
  StorefrontTheme,
  SessionStatus,
} from './domain.js';
import { ShirtTypeSchema, SceneSchema } from './scene.js';

/**
 * Request/response body schemas — the wire contract. The backend parses inbound
 * bodies with the `*Body` schemas; the frontend infers its payload/response
 * types from the same definitions. This is where contract drift is killed.
 */

// ---- Auth ----
export const RegisterBody = z.object({
  email: z.string().email(),
  business_name: z.string().min(1),
  password: z.string().min(8),
});
export type RegisterBody = z.infer<typeof RegisterBody>;

export const LoginBody = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type LoginBody = z.infer<typeof LoginBody>;

export const RefreshBody = z.object({
  refresh_token: z.string().min(1),
});
export type RefreshBody = z.infer<typeof RefreshBody>;

export const TokenPair = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
});
export type TokenPair = z.infer<typeof TokenPair>;

export const AuthResponse = z.object({
  seller: SellerSchema,
  access_token: z.string(),
  refresh_token: z.string(),
});
export type AuthResponse = z.infer<typeof AuthResponse>;

// ---- Sessions (seller) ----
export const CreateSessionBody = z.object({
  customer_name: z.string().min(1).optional(),
  shirt_type: ShirtTypeSchema,
  shirt_color: z.string().min(1),
  /** Optional custom material slug; when set, overrides the built-in type backdrop. */
  material_slug: z.string().optional(),
  allowed_colors: z.array(z.string()).optional(),
  price_quoted: z.number().int().nonnegative().optional(),
  notes: z.string().optional(),
});
export type CreateSessionBody = z.infer<typeof CreateSessionBody>;

// Shirt type/colour/material editable after creation; status → archived;
// visibility toggles whether a submitted design appears on the storefront.
export const PatchSessionBody = z.object({
  status: z.literal('archived').optional(),
  shirt_type: ShirtTypeSchema.optional(),
  shirt_color: z.string().min(1).optional(),
  material_slug: z.string().nullable().optional(),
  customer_name: z.string().min(1).optional(),
  visibility: z.enum(['private', 'public']).optional(),
});
export type PatchSessionBody = z.infer<typeof PatchSessionBody>;

export const SessionListQuery = z.object({
  cursor: z.string().optional(),
  status: SessionStatus.optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type SessionListQuery = z.infer<typeof SessionListQuery>;

export const SessionListResponse = z.object({
  items: z.array(SessionSchema),
});
export const SessionListMeta = z.object({
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
});
export type SessionListMeta = z.infer<typeof SessionListMeta>;

export const SessionDetailResponse = z.object({
  session: SessionSchema,
  design: DesignSchema,
});
export type SessionDetailResponse = z.infer<typeof SessionDetailResponse>;

// ---- Public design surface ----
export const PublicSessionResponse = z.object({
  session: PublicSessionSchema,
  design: DesignSchema,
  brand: PublicBrandSchema,
});
export type PublicSessionResponse = z.infer<typeof PublicSessionResponse>;

export const SaveDesignBody = z.object({
  canvas_front: SceneSchema,
  canvas_back: SceneSchema,
});
export type SaveDesignBody = z.infer<typeof SaveDesignBody>;

export const RegisterAssetBody = z.object({
  storage_key: z.string().min(1),
  mime: z.string().min(1),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  bytes: z.number().int().positive().optional(),
});
export type RegisterAssetBody = z.infer<typeof RegisterAssetBody>;

export const SubmitBody = z.object({
  customer_name: z.string().min(1).optional(),
});
export type SubmitBody = z.infer<typeof SubmitBody>;

// ---- Storefront ----
export const StorefrontResponse = z.object({
  brand: PublicBrandSchema,
  shirt_colors: z.array(z.string()),
  /** Materials the seller offers (filtered by visible_materials config). */
  materials: z.array(MaterialSchema),
  /** Storefront cards: materials + public designed sessions. */
  items: z.array(StorefrontItemSchema),
});
export type StorefrontResponse = z.infer<typeof StorefrontResponse>;

export const StartSessionBody = z.object({
  shirt_type: ShirtTypeSchema,
  shirt_color: z.string().min(1),
  material_slug: z.string().optional(),
  /** Customer's name, captured at storefront entry. */
  customer_name: z.string().min(1).optional(),
  /** Clone a public session's design into the new session (storefront "use this"). */
  from_token: z.string().optional(),
});
export type StartSessionBody = z.infer<typeof StartSessionBody>;

export const StartSessionResponse = z.object({
  token: z.string(),
});
export type StartSessionResponse = z.infer<typeof StartSessionResponse>;

// ---- Export ----
export const ExportBody = z
  .object({
    preset: z.enum(EXPORT_PRESET_IDS as [string, ...string[]]).optional(),
    w: z.number().int().min(64).max(10000).optional(),
    h: z.number().int().min(64).max(10000).optional(),
    dpi: z.number().int().min(72).max(600).optional(),
    side: z.enum(['front', 'back']).default('front'),
  })
  .refine((b) => b.preset !== undefined || (b.w !== undefined && b.h !== undefined), {
    message: 'Provide a preset or both w and h',
  });
export type ExportBody = z.infer<typeof ExportBody>;

export const ExportResponse = z.object({
  key: z.string(),
  url: z.string(),
});
export type ExportResponse = z.infer<typeof ExportResponse>;

// ---- Notifications ----
export const PushSubscriptionBody = z.object({
  endpoint: z.string().url(),
  keys: z.object({ p256dh: z.string(), auth: z.string() }),
});
export type PushSubscriptionBody = z.infer<typeof PushSubscriptionBody>;

// ---- Colours (seller-managed) ----
export const CreateColorBody = z.object({
  label: z.string().min(1).max(40),
  hex: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'must be a hex colour like #1a2b3c'),
  /** Optional explicit slug; derived from label if omitted. */
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'lowercase letters, digits, hyphens only')
    .min(1)
    .max(40)
    .optional(),
});
export type CreateColorBody = z.infer<typeof CreateColorBody>;

const hex = z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'must be a hex colour');

// ---- Brand / storefront config (seller-managed) ----
export const UpdateBrandBody = z.object({
  business_name: z.string().min(1).max(80).optional(),
  description: z.string().max(500).nullable().optional(),
  welcome_voice: z.string().max(280).nullable().optional(),
  brand_logo_key: z.string().nullable().optional(),
  storefront_color: hex.nullable().optional(),
  storefront_font: z.string().nullable().optional(),
  storefront_theme: StorefrontTheme.nullable().optional(),
  visible_materials: z.array(z.string()).nullable().optional(),
});
export type UpdateBrandBody = z.infer<typeof UpdateBrandBody>;

/** Staged onboarding: the store-setup form. Submitting flips registration_status
 *  to BUSINESS_SUBMITTED. business_name is required here (unlike a later edit). */
export const SubmitBusinessBody = z.object({
  business_name: z.string().min(1).max(80),
  description: z.string().max(500).optional(),
  storefront_color: hex.optional(),
  storefront_font: z.string().optional(),
  brand_logo_key: z.string().optional(),
});
export type SubmitBusinessBody = z.infer<typeof SubmitBusinessBody>;

// ---- Materials (seller-managed) ----
export const CreateMaterialBody = z.object({
  label: z.string().min(1).max(60),
  /** R2 key of the uploaded material photo. */
  image_key: z.string().min(1),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'lowercase letters, digits, hyphens only')
    .min(1)
    .max(60)
    .optional(),
});
export type CreateMaterialBody = z.infer<typeof CreateMaterialBody>;
