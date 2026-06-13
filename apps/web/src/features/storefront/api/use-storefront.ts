import { apiClient, EP, type ApiResponse } from '@shirtify/api';
import { type StorefrontResponse } from '@shirtify/core';
import { useQuery } from '@tanstack/react-query';

/** Public storefront: brand + available shirt types/colours for a seller slug. */
export const useStorefront = (slug: string) =>
  useQuery({
    queryKey: ['storefront', slug],
    queryFn: async () => {
      const res = await apiClient.get(EP.STOREFRONT(slug)).json<ApiResponse<StorefrontResponse>>();
      return res.data;
    },
    enabled: slug.length > 0,
    retry: false,
  });
