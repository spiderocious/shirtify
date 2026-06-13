import { apiClient, EP, type ApiResponse } from '@shirtify/api';
import { type Asset, type RegisterAssetBody } from '@shirtify/core';
import { useMutation } from '@tanstack/react-query';

interface RegisterArgs {
  token: string;
  asset: RegisterAssetBody;
}

/** Record an image uploaded to R2 as an asset on this session. */
export const useRegisterAsset = () =>
  useMutation({
    mutationFn: async ({ token, asset }: RegisterArgs) => {
      const res = await apiClient
        .post(EP.PUBLIC_ASSETS(token), { json: asset })
        .json<ApiResponse<{ asset: Asset }>>();
      return res.data.asset;
    },
  });
