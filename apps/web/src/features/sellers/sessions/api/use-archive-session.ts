import { apiClient, EP, type ApiResponse } from '@shirtify/api';
import { type Session } from '@shirtify/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@shared/api/query-keys.ts';

export const useArchiveSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient
        .patch(EP.SESSION(id), { json: { status: 'archived' } })
        .json<ApiResponse<{ session: Session }>>();
      return res.data.session;
    },
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.session(session.id) });
    },
  });
};
