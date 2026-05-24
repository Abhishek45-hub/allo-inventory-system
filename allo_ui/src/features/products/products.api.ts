import { apiClient } from "@/services/api/client";
import { endpoints } from "@/services/endpoints";
import type { ApiEnvelope } from "@/types/api";

export interface ProductInventoryView {
	id: string;
	sku: string;
	name: string;
	description?: string;
	warehouses: {
		warehouseId: string;
		warehouseName: string;
		totalQuantity: number;
		reservedQuantity: number;
		availableQuantity: number;
	}[];
}

export const listProductsApi = async (): Promise<ProductInventoryView[]> => {
	const response = await apiClient.get<ApiEnvelope<ProductInventoryView[]>>(
		endpoints.products,
	);
	return response.data.data;
};
