// Routing
export { ROUTES } from './constants/routes.js';

// Design constants (shirt types, colours, fonts, export presets)
export {
  SHIRT_TYPES,
  SHIRT_TYPE_LABELS,
  SHIRT_COLORS,
  FONTS,
  FONT_IDS,
  fontFamilyById,
  EXPORT_PRESETS,
  EXPORT_PRESET_IDS,
  MAX_UPLOAD_BYTES,
} from './constants/shirt.js';
export type { ShirtTypeName, FontDef } from './constants/shirt.js';

// Canvas scene schema (shared by editor, autosave, exporter)
export {
  SceneSchema,
  LayerSchema,
  TextLayerSchema,
  ImageLayerSchema,
  ShapeLayerSchema,
  GraphicLayerSchema,
  GradientSchema,
  FillSchema,
  FilterSchema,
  FILTER_KINDS,
  ShapeKindSchema,
  SHAPE_KINDS,
  ShirtTypeSchema,
  SceneSide,
  emptyScene,
} from './schemas/scene.js';
export type {
  Gradient,
  Fill,
  FilterKind,
  ShapeKind,
  ShapeLayer,
  GraphicLayer,
} from './schemas/scene.js';

// Domain schemas
export {
  SellerSchema,
  PublicBrandSchema,
  StorefrontConfig,
  StorefrontTheme,
  HeroStyle,
  StorefrontLayout,
  defaultStorefrontTheme,
  BrandColors,
  SellerRole,
  RegistrationStatus,
  SessionSchema,
  PublicSessionSchema,
  SessionKind,
  SessionStatus,
  SessionVisibility,
  DesignSchema,
  AssetSchema,
  AssetKind,
  ColorSchema,
  ColorScope,
  MaterialSchema,
  MaterialScope,
  StorefrontItemSchema,
} from './schemas/domain.js';
export type { Color, Material, StorefrontItem } from './schemas/domain.js';

// Templates
export { TEMPLATES, searchTemplates, applyTemplate } from './constants/templates.js';
export type { DesignTemplate } from './constants/templates.js';

// Graphics catalogue (lucide icons + emojis)
export { ICONS, searchIcons } from './constants/icons.js';
export type { IconDef } from './constants/icons.js';
export { EMOJIS, searchEmojis } from './constants/emojis.js';
export type { EmojiDef } from './constants/emojis.js';

// API wire schemas
export * from './schemas/api.js';

// Auth / token storage
export { createTokenStorage, TOKEN_KEYS } from './auth/token-storage.js';
export type { TokenStorage } from './auth/token-storage.js';

// Domain types (inferred)
export * from './types/index.js';

// Storage (isomorphic R2 file-service client)
export { createFileService } from './storage/file-service.js';
export type { FileService, UploadTicket, FileServiceOptions } from './storage/file-service.js';

// Helpers
export { formatRelative } from './time/format-relative.js';
export { idempotencyKey } from './ids/idempotency-key.js';
export { generateToken, slugify } from './ids/token.js';
