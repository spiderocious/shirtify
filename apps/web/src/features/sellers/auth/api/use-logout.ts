import { apiClient, EP } from '@shirtify/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { clearTokens } from '@shared/api/tokens.ts';

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      try {
        await apiClient.post(EP.AUTH_LOGOUT);
      } catch {
        // Logout is best-effort; clear locally regardless of the server result.
      }
    },
    onSuccess: () => {
      clearTokens();
      queryClient.clear();
    },
  });
};
