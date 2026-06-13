/**
 * Centralised React Query keys. Named factories make cache invalidation explicit
 * and discoverable (frontend-master §5.4). Import these wherever a query or an
 * invalidation references a cache entry.
 */
export const queryKeys = {
  me: () => ['me'] as const,
  sessions: (params?: { cursor?: string; status?: string }) =>
    ['sessions', params ?? {}] as const,
  session: (id: string) => ['session', id] as const,
  colors: () => ['colors'] as const,
} as const;
