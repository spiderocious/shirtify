import { apiClient, EP, type ApiResponse } from '@shirtify/api';
import { type Seller } from '@shirtify/core';
import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@shared/api/query-keys.ts';
import { hasAccessToken } from '@shared/api/tokens.ts';

/** The authenticated seller, or an error when the token is missing/invalid. */
export const useMe = () =>
  useQuery({
    queryKey: queryKeys.me(),
    queryFn: async () => {
      const res = await apiClient.get(EP.AUTH_ME).json<ApiResponse<{ seller: Seller }>>();
      return res.data.seller;
    },
    enabled: hasAccessToken(),
    retry: false,
    staleTime: 5 * 60_000,
  });
