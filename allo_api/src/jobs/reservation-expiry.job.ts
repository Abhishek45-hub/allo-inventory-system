import cron from 'node-cron';
import { logger } from '@/config/logger';
import { ReservationService } from '@/services/reservation.service';

const service = new ReservationService();

export const startReservationExpiryJob = (): void => {
  let idempotencyCleanupTick = 0;

  cron.schedule('*/1 * * * *', async () => {
    try {
      const released = await service.releaseExpiredReservations();
      if (released > 0) {
        logger.info({ released }, 'expired_reservations_released');
      }

      idempotencyCleanupTick += 1;
      if (idempotencyCleanupTick >= 10) {
        idempotencyCleanupTick = 0;
        const removed = await service.cleanupExpiredIdempotencyKeys();
        if (removed > 0) {
          logger.info({ removed }, 'expired_idempotency_keys_removed');
        }
      }
    } catch (error) {
      logger.error({ error }, 'reservation_expiry_job_failed');
    }
  });
};
