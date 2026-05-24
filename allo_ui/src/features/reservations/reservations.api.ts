import { apiClient } from "@/services/api/client";
import { endpoints } from "@/services/endpoints";
import type { ApiEnvelope } from "@/types/api";

export interface ReservationView {
	id: string;
	productId: string;
	warehouseId: string;
	quantity: number;
	status: "PENDING" | "CONFIRMED" | "RELEASED";
	expiresAt: string;
}

export const reserveApi = async (payload: {
	productId: string;
	warehouseId: string;
	quantity: number;
	idempotencyKey: string;
}) => {
	const response = await apiClient.post<ApiEnvelope<ReservationView>>(
		endpoints.reservations,
		{
			productId: payload.productId,
			warehouseId: payload.warehouseId,
			quantity: payload.quantity,
		},
		{
			headers: {
				"Idempotency-Key": payload.idempotencyKey,
			},
		},
	);

	return response.data.data;
};

export const getReservationApi = async (id: string) => {
	const response = await apiClient.get<ApiEnvelope<ReservationView>>(
		`${endpoints.reservations}/${id}`,
	);
	return response.data.data;
};

export const confirmReservationApi = async (payload: {
	id: string;
	idempotencyKey: string;
}) => {
	const response = await apiClient.post<ApiEnvelope<ReservationView>>(
		`${endpoints.reservations}/${payload.id}/confirm`,
		undefined,
		{
			headers: {
				"Idempotency-Key": payload.idempotencyKey,
			},
		},
	);
	return response.data.data;
};

export const releaseReservationApi = async (id: string) => {
	const response = await apiClient.post<ApiEnvelope<ReservationView>>(
		`${endpoints.reservations}/${id}/release`,
	);
	return response.data.data;
};
