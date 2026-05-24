import { z } from "zod";

export const reservationSchema = z.object({
	productId: z.string().uuid(),
	warehouseId: z.string().uuid(),
	quantity: z.number().int().positive(),
});

export type ReservationSchema = z.infer<typeof reservationSchema>;
