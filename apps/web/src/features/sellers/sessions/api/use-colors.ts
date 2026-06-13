import { apiClient, EP, type ApiResponse } from '@shirtify/api';
import { type Color } from '@shirtify/core';
import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@shared/api/query-keys.ts';

/** The colours available to the seller (platform ∪ her own). */
export const useColors = () =>
  useQuery({
    queryKey: queryKeys.colors(),
    queryFn: async () => {
      const res = await apiClient.get(EP.COLORS).json<ApiResponse<{ colors: Color[] }>>();
      return res.data.colors;
    },
    staleTime: 5 * 60_000,
  });
