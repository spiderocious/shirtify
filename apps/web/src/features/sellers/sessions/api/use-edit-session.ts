import { apiClient, EP, type ApiResponse } from '@shirtify/api';
import { type Session, type ShirtType } from '@shirtify/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@shared/api/query-keys.ts';

interface EditArgs {
  id: string;
  patch: {
    shirt_type?: ShirtType;
    shirt_color?: string;
    material_slug?: string | null;
  };
}

/** Edit a session's shirt type / colour / material after creation. */
export const useEditSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: EditArgs) => {
      const res = await apiClient
        .patch(EP.SESSION(id), { json: patch })
        .json<ApiResponse<{ session: Session }>>();
      return res.data.session;
    },
    onSuccess: (session) => {
      qc.invalidateQueries({ queryKey: queryKeys.session(session.id) });
      qc.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};
