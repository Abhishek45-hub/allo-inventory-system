import { z } from 'zod';

export const createReservationSchema = z.object({
  body: z.object({
    productId: z.string().uuid(),
    warehouseId: z.string().uuid(),
    quantity: z.number().int().positive(),
  }),
});

export const reservationIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
