import { apiClient, EP, type ApiResponse } from '@shirtify/api';
import { type StartSessionBody, type StartSessionResponse } from '@shirtify/core';
import { useMutation } from '@tanstack/react-query';

interface StartArgs {
  slug: string;
  body: StartSessionBody;
}

/** Cold walk-in: start a public session and get its design token. */
export const useStartSession = () =>
  useMutation({
    mutationFn: async ({ slug, body }: StartArgs) => {
      const res = await apiClient
        .post(EP.STOREFRONT_START(slug), { json: body })
        .json<ApiResponse<StartSessionResponse>>();
      return res.data;
    },
  });
