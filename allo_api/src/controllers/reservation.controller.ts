import type { Request, Response } from 'express';
import { HttpStatus } from '@/constants/http-status';
import { ReservationService } from '@/services/reservation.service';
import { ok } from '@/utils/response';
import { AppError } from '@/utils/app-error';

const reservationService = new ReservationService();

export class ReservationController {
  async get(req: Request, res: Response): Promise<void> {
    const reservationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const reservation = await reservationService.getReservation(reservationId);
    // Ownership check – only the owner or an admin may view the reservation
    const requesterId = req.auth?.userId;
    const requesterRole = req.auth?.role;
    if (reservation.userId !== requesterId && requesterRole !== 'ADMIN') {
      throw new AppError(HttpStatus.FORBIDDEN, 'Access denied to reservation');
    }
    res.status(HttpStatus.OK).json(ok('Reservation fetched', reservation));
  }

  async create(req: Request, res: Response): Promise<void> {
    const reservation = await reservationService.createReservation({
      userId: req.auth?.userId,
      productId: req.body.productId,
      warehouseId: req.body.warehouseId,
      quantity: req.body.quantity,
    });

    res.status(HttpStatus.CREATED).json(ok('Reservation created', reservation));
  }

  async confirm(req: Request, res: Response): Promise<void> {
    const reservationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const reservation = await reservationService.confirmReservation(reservationId, req.auth?.userId);
    res.status(HttpStatus.OK).json(ok('Reservation confirmed', reservation));
  }

  async release(req: Request, res: Response): Promise<void> {
    const reservationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const reservation = await reservationService.releaseReservation(reservationId, req.auth?.userId);
    res.status(HttpStatus.OK).json(ok('Reservation released', reservation));
  }
}
