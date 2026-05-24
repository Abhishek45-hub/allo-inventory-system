import { ReservationStatus } from '@prisma/client';
import { ReservationService } from '@/services/reservation.service';

describe('reservation service contract', () => {
  it('exposes service methods', () => {
    const service = new ReservationService();
    expect(typeof service.createReservation).toBe('function');
    expect(typeof service.confirmReservation).toBe('function');
    expect(typeof service.releaseReservation).toBe('function');
    expect(ReservationStatus.PENDING).toBe('PENDING');
  });
});
