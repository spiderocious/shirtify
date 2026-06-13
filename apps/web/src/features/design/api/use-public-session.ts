import { apiClient, EP, type ApiResponse } from '@shirtify/api';
import { type PublicSessionResponse } from '@shirtify/core';
import { useQuery } from '@tanstack/react-query';

/** Load the customer design context (session + design + brand) for a token. */
export const usePublicSession = (token: string) =>
  useQuery({
    queryKey: ['public-session', token],
    queryFn: async () => {
      const res = await apiClient
        .get(EP.PUBLIC_SESSION(token))
        .json<ApiResponse<PublicSessionResponse>>();
      return res.data;
    },
    enabled: token.length > 0,
    retry: false,
    staleTime: Infinity, // the design is edited locally; we don't refetch over edits
  });
