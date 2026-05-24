"use client";

import { listProductsApi } from "@/features/products/products.api";
import { useQuery } from "@tanstack/react-query";

export const useProducts = () => {
	return useQuery({
		queryKey: ["products"],
		queryFn: listProductsApi,
		refetchInterval: 15_000,
		refetchOnWindowFocus: true,
	});
};
