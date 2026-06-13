import { apiClient, EP, type ApiResponse } from '@shirtify/api';
import { type Session, type SubmitBody } from '@shirtify/core';
import { useMutation } from '@tanstack/react-query';

interface SubmitArgs {
  token: string;
  body: SubmitBody;
}

/** Finalise the design and route it back to the seller. */
export const useSubmitDesign = () =>
  useMutation({
    mutationFn: async ({ token, body }: SubmitArgs) => {
      const res = await apiClient
        .post(EP.PUBLIC_SUBMIT(token), { json: body })
        .json<ApiResponse<{ session: Session }>>();
      return res.data.session;
    },
  });
