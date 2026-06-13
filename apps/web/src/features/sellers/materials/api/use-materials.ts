import { apiClient, EP, type ApiResponse } from '@shirtify/api';
import { type Material, type CreateMaterialBody } from '@shirtify/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const materialsKey = () => ['materials'] as const;

/** Platform built-ins + the seller's own materials. */
export const useMaterials = () =>
  useQuery({
    queryKey: materialsKey(),
    queryFn: async () => {
      const res = await apiClient.get(EP.MATERIALS).json<ApiResponse<{ materials: Material[] }>>();
      return res.data.materials;
    },
    staleTime: 5 * 60_000,
  });

export const useCreateMaterial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateMaterialBody) => {
      const res = await apiClient
        .post(EP.MATERIALS, { json: body })
        .json<ApiResponse<{ material: Material }>>();
      return res.data.material;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: materialsKey() }),
  });
};

export const useDeleteMaterial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(EP.MATERIAL(id));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: materialsKey() }),
  });
};
