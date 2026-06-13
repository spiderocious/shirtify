import { apiClient, EP, type ApiResponse } from '@shirtify/api';
import { type SessionDetailResponse } from '@shirtify/core';
import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@shared/api/query-keys.ts';

/** A single session + its design. */
export const useSession = (id: string) =>
  useQuery({
    queryKey: queryKeys.session(id),
    queryFn: async () => {
      const res = await apiClient
        .get(EP.SESSION(id))
        .json<ApiResponse<SessionDetailResponse>>();
      return res.data;
    },
    enabled: id.length > 0,
  });
