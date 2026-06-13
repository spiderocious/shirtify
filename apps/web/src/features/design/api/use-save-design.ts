import { apiClient, EP, type ApiResponse } from '@shirtify/api';
import { type Design, type Scene } from '@shirtify/core';
import { useMutation } from '@tanstack/react-query';

interface SaveArgs {
  token: string;
  canvas_front: Scene;
  canvas_back: Scene;
}

/** Autosave the customer's canvas (debounced by the caller). */
export const useSaveDesign = () =>
  useMutation({
    mutationFn: async ({ token, canvas_front, canvas_back }: SaveArgs) => {
      const res = await apiClient
        .put(EP.PUBLIC_DESIGN(token), { json: { canvas_front, canvas_back } })
        .json<ApiResponse<{ design: Design }>>();
      return res.data.design;
    },
  });
