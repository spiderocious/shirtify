import { apiClient, EP, type ApiResponse } from '@shirtify/api';
import { type Seller, type UpdateBrandBody } from '@shirtify/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@shared/api/query-keys.ts';

/** Update storefront/brand config; refreshes the cached seller. */
export const useUpdateBrand = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateBrandBody) => {
      const res = await apiClient
        .patch(EP.ME_BRAND, { json: body })
        .json<ApiResponse<{ seller: Seller }>>();
      return res.data.seller;
    },
    onSuccess: (seller) => qc.setQueryData(queryKeys.me(), seller),
  });
};
