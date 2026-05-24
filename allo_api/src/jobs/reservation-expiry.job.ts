import cron from 'node-cron';
import { logger } from '@/config/logger';
import { ReservationService } from '@/services/reservation.service';

const service = new ReservationService();

export const startReservationExpiryJob = (): void => {
  cron.schedule('*/1 * * * *', async () => {
    try {
      const released = await service.releaseExpiredReservations();
      if (released > 0) {
        logger.info({ released }, 'expired_reservations_released');
      }
    } catch (error) {
      logger.error({ error }, 'reservation_expiry_job_failed');
    }
  });
};
