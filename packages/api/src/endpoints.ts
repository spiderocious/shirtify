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

  // Sessions (seller, auth)
  SESSIONS: 'api/v1/sessions',
  SESSION: (id: string) => `api/v1/sessions/${id}`,
  SESSION_EXPORT: (id: string) => `api/v1/sessions/${id}/export`,

  // Public design surface (token = key)
  PUBLIC_SESSION: (token: string) => `api/v1/c/${token}`,
  PUBLIC_DESIGN: (token: string) => `api/v1/c/${token}/design`,
  PUBLIC_ASSETS: (token: string) => `api/v1/c/${token}/assets`,
  PUBLIC_SUBMIT: (token: string) => `api/v1/c/${token}/submit`,

  // Storefront (public)
  STOREFRONT: (slug: string) => `api/v1/s/${slug}`,
  STOREFRONT_START: (slug: string) => `api/v1/s/${slug}/start`,

  // Notifications (seller, auth)
  PUSH_SUBSCRIBE: 'api/v1/notifications/subscribe',
} as const;
