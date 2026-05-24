'use client';

import { useQuery } from '@tanstack/react-query';
import { listProductsApi } from '@/features/products/products.api';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: listProductsApi,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });
};
