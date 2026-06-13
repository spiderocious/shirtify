import { apiClient, EP, type ApiResponse } from '@shirtify/api';
import { type Seller, type SubmitBusinessBody } from '@shirtify/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@shared/api/query-keys.ts';

/** Staged onboarding: submit business details → advances registration_status. */
export const useSubmitBusiness = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: SubmitBusinessBody) => {
      const res = await apiClient
        .patch(EP.ME_BUSINESS, { json: body })
        .json<ApiResponse<{ seller: Seller }>>();
      return res.data.seller;
    },
    onSuccess: (seller) => qc.setQueryData(queryKeys.me(), seller),
  });
};
