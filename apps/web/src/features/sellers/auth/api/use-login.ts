import { apiClient, EP, type ApiResponse } from '@shirtify/api';
import { type AuthResponse, type LoginBody } from '@shirtify/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@shared/api/query-keys.ts';
import { storeTokens } from '@shared/api/tokens.ts';

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: LoginBody) => {
      const res = await apiClient
        .post(EP.AUTH_LOGIN, { json: payload })
        .json<ApiResponse<AuthResponse>>();
      return res.data;
    },
    onSuccess: (auth) => {
      storeTokens(auth);
      queryClient.setQueryData(queryKeys.me(), auth.seller);
    },
  });
};
