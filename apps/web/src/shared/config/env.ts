function optional(key: string, fallback: string): string {
  const value = import.meta.env[key];
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

// The customer app and seller dashboard now share this origin, so the customer
// link defaults to it. Override with VITE_WEB_BASE_URL only if they ever split.
const sameOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

export const ENV = {
  API_BASE_URL: optional('VITE_API_BASE_URL', 'http://localhost:9091'),
  WEB_BASE_URL: optional('VITE_WEB_BASE_URL', sameOrigin),
  FILE_SERVICE_URL: optional(
    'VITE_FILE_SERVICE_URL',
    'https://go-file-service-production.up.railway.app',
  ),
} as const;
