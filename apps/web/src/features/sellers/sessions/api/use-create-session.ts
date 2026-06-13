import { apiClient, EP, type ApiResponse } from '@shirtify/api';
import { type CreateSessionBody, type Session } from '@shirtify/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CreateSessionArgs {
  body: CreateSessionBody;
  /** Stable per user-intent so react-query retries don't create duplicates. */
  idempotencyKey: string;
}

export const useCreateSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ body, idempotencyKey }: CreateSessionArgs) => {
      const res = await apiClient
        .post(EP.SESSIONS, {
          json: body,
          headers: { 'Idempotency-Key': idempotencyKey },
        })
        .json<ApiResponse<{ session: Session }>>();
      return res.data.session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};
