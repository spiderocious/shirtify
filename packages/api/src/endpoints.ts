// Single source of truth for backend URL paths. Apps reach the server through
// the named constants here so a rename touches one line, not dozens.
export const EP = {
  HEALTH: 'api/v1/health',

  // Seller auth
  AUTH_LOGIN: 'api/v1/auth/login',
  AUTH_REGISTER: 'api/v1/auth/register',
  AUTH_REFRESH: 'api/v1/auth/refresh',
  AUTH_LOGOUT: 'api/v1/auth/logout',
  AUTH_ME: 'api/v1/me',
  ME_BRAND: 'api/v1/me/brand',
  ME_BUSINESS: 'api/v1/me/business',

  // Sessions (seller, auth)
  SESSIONS: 'api/v1/sessions',
  SESSION: (id: string) => `api/v1/sessions/${id}`,
  SESSION_EXPORT: (id: string) => `api/v1/sessions/${id}/export`,

  // Colours (seller, auth)
  COLORS: 'api/v1/colors',
  COLOR: (id: string) => `api/v1/colors/${id}`,

  // Materials (seller, auth)
  MATERIALS: 'api/v1/materials',
  MATERIAL: (id: string) => `api/v1/materials/${id}`,

  // Public design surface (token = key)
  PUBLIC_SESSION: (token: string) => `api/v1/c/${token}`,
  PUBLIC_DESIGN: (token: string) => `api/v1/c/${token}/design`,
  PUBLIC_ASSETS: (token: string) => `api/v1/c/${token}/assets`,
  PUBLIC_SUBMIT: (token: string) => `api/v1/c/${token}/submit`,

  // AI design surface (token = key)
  PUBLIC_AI_GENERATE: (token: string) => `api/v1/c/${token}/ai/generate`,
  PUBLIC_AI_EDIT: (token: string) => `api/v1/c/${token}/ai/edit`,
  PUBLIC_AI_TRYON: (token: string) => `api/v1/c/${token}/ai/tryon`,
  PUBLIC_AI_JOB: (token: string, id: string) => `api/v1/c/${token}/ai/jobs/${id}`,

  // Storefront (public)
  STOREFRONT: (slug: string) => `api/v1/s/${slug}`,
  STOREFRONT_START: (slug: string) => `api/v1/s/${slug}/start`,

  // Notifications (seller, auth)
  PUSH_SUBSCRIBE: 'api/v1/notifications/subscribe',
} as const;
