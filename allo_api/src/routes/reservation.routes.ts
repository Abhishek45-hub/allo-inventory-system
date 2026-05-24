import { Router } from 'express';
import { ReservationController } from '@/controllers/reservation.controller';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { idempotencyMiddleware } from '@/middlewares/idempotency.middleware';
import { validate } from '@/middlewares/validate.middleware';
import { createReservationSchema, reservationIdSchema } from '@/schemas/reservation.schema';
import { asyncHandler } from '@/utils/async-handler';

const router = Router();
const controller = new ReservationController();

router.use(authMiddleware);

router.get(
  '/:id',
  validate(reservationIdSchema),
  asyncHandler(controller.get.bind(controller)),
);
router.post(
  '/',
  idempotencyMiddleware,
  validate(createReservationSchema),
  asyncHandler(controller.create.bind(controller)),
);
router.post(
  '/:id/confirm',
  idempotencyMiddleware,
  validate(reservationIdSchema),
  asyncHandler(controller.confirm.bind(controller)),
);
router.post(
  '/:id/release',
  validate(reservationIdSchema),
  asyncHandler(controller.release.bind(controller)),
);

export { router as reservationRoutes };
