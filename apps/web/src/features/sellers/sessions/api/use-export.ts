import { apiClient, EP, type ApiResponse } from '@shirtify/api';
import { type ExportBody, type ExportResponse } from '@shirtify/core';
import { useMutation } from '@tanstack/react-query';

/** Render a session's design to a PNG at the chosen size and get a download URL. */
export const useExport = (sessionId: string) =>
  useMutation({
    mutationFn: async (body: ExportBody) => {
      const res = await apiClient
        .post(EP.SESSION_EXPORT(sessionId), { json: body })
        .json<ApiResponse<ExportResponse>>();
      return res.data;
    },
  });
