import { apiClient, EP, type ApiResponse } from '@shirtify/api';
import { type Session, type SessionStatus } from '@shirtify/core';
import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@shared/api/query-keys.ts';

interface SessionsPage {
  items: Session[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface SessionsQuery {
  cursor?: string;
  status?: SessionStatus;
}

/** One cursor page of the seller's sessions inbox. */
export const useSessions = (params: SessionsQuery = {}) =>
  useQuery({
    queryKey: queryKeys.sessions(params),
    queryFn: async (): Promise<SessionsPage> => {
      const search = new URLSearchParams();
      if (params.cursor) search.set('cursor', params.cursor);
      if (params.status) search.set('status', params.status);

      const res = await apiClient
        .get(EP.SESSIONS, { searchParams: search })
        .json<ApiResponse<{ items: Session[] }>>();

      const meta = res.meta as { nextCursor: string | null; hasMore: boolean } | undefined;
      return {
        items: res.data.items,
        nextCursor: meta?.nextCursor ?? null,
        hasMore: meta?.hasMore ?? false,
      };
    },
  });
