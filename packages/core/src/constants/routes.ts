// Centralised route table. Apps import from here so route strings have
// exactly one source of truth across web + admin + website surfaces.
export const ROUTES = {
  // Public marketing
  HOME: '/',
  PRICING: '/pricing',
  ABOUT: '/about',

  // Seller auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',

  // Seller dashboard (admin-web)
  DASHBOARD: '/dashboard',
  SESSION_DETAIL: (id: string) => `/dashboard/sessions/${id}`,
  BRAND: '/dashboard/brand',

  // Customer-facing (web)
  CUSTOMER_DESIGN: (token: string) => `/c/${token}`,
  STOREFRONT: (slug: string) => `/s/${slug}`,

  // Design-system preview (the @shirtify/ui viewer)
  PREVIEW: '/preview',

  // Admin dashboard home (current scaffold entry — reworked in Phase 2)
  ADMIN_LOGIN: '/admin/login',
  ADMIN_HOME: '/admin',
} as const;
