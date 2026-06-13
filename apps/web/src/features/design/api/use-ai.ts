import { apiClient, EP, type ApiResponse } from '@shirtify/api';
import {
  type AiGenerateBody,
  type AiEditBody,
  type AiTryOnBody,
  type AiJob,
} from '@shirtify/core';
import { useMutation, useQuery } from '@tanstack/react-query';

/**
 * AI design surface hooks. Each action POSTs and returns the freshly-created
 * job (status pending); `useAiJob` then polls until it settles. UI flow:
 * mutate → take job.id → useAiJob(token, id) → render results when done.
 */

const postJob = async (url: string, json: unknown): Promise<AiJob> => {
  const res = await apiClient.post(url, { json }).json<ApiResponse<{ job: AiJob }>>();
  return res.data.job;
};

export const useAiGenerate = () =>
  useMutation({
    mutationFn: ({ token, body }: { token: string; body: AiGenerateBody }) =>
      postJob(EP.PUBLIC_AI_GENERATE(token), body),
  });

export const useAiEdit = () =>
  useMutation({
    mutationFn: ({ token, body }: { token: string; body: AiEditBody }) =>
      postJob(EP.PUBLIC_AI_EDIT(token), body),
  });

export const useAiTryOn = () =>
  useMutation({
    mutationFn: ({ token, body }: { token: string; body: AiTryOnBody }) =>
      postJob(EP.PUBLIC_AI_TRYON(token), body),
  });

/** Poll a job until it's done/failed. Pass a null id to stay idle. */
export const useAiJob = (token: string, jobId: string | null) =>
  useQuery({
    queryKey: ['ai-job', token, jobId],
    enabled: jobId !== null,
    refetchInterval: (query) => {
      const job = query.state.data;
      return job && (job.status === 'done' || job.status === 'failed') ? false : 1500;
    },
    queryFn: async (): Promise<AiJob> => {
      const res = await apiClient
        .get(EP.PUBLIC_AI_JOB(token, jobId!))
        .json<ApiResponse<{ job: AiJob }>>();
      return res.data.job;
    },
  });
