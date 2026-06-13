import { apiClient, EP, type ApiResponse } from '@shirtify/api';
import { type Session, type SessionVisibility } from '@shirtify/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@shared/api/query-keys.ts';

/** Toggle whether a submitted design is featured on the storefront. */
export const useSessionVisibility = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, visibility }: { id: string; visibility: SessionVisibility }) => {
      const res = await apiClient
        .patch(EP.SESSION(id), { json: { visibility } })
        .json<ApiResponse<{ session: Session }>>();
      return res.data.session;
    },
    onSuccess: (session) => {
      qc.invalidateQueries({ queryKey: queryKeys.session(session.id) });
      qc.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};
