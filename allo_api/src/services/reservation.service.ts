import { Prisma, ReservationStatus } from '@prisma/client';
import { env } from '@/config/env';
import { prisma } from '@/database/prisma';
import { HttpStatus } from '@/constants/http-status';
import { AppError } from '@/utils/app-error';
import { InventoryRepository } from '@/repositories/inventory.repository';
import { ReservationRepository } from '@/repositories/reservation.repository';

export class ReservationService {
  private async resolveUserId(userId?: string) {
    if (userId) {
      return userId;
    }

    const user = await prisma.user.findFirst({
      where: { role: 'CUSTOMER' },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });

    if (!user) {
      throw new AppError(HttpStatus.INTERNAL_SERVER_ERROR, 'No customer user exists. Run the seed script.');
    }

    return user.id;
  }

  async getReservation(reservationId: string) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        product: { select: { id: true, sku: true, name: true } },
        warehouse: { select: { id: true, code: true, name: true } },
      },
    });

    if (!reservation) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Reservation not found');
    }

    if (reservation.status === ReservationStatus.PENDING && reservation.expiresAt.getTime() <= Date.now()) {
      await this.releaseReservation(reservation.id);
      throw new AppError(HttpStatus.GONE, 'Reservation expired');
    }

    return reservation;
  }

  async createReservation(input: {
    userId?: string;
    productId: string;
    warehouseId: string;
    quantity: number;
  }) {
    await this.releaseExpiredReservations();
    const userId = await this.resolveUserId(input.userId);

    return prisma.$transaction(
      async (tx) => {
        const inventoryRepository = new InventoryRepository(tx as Prisma.TransactionClient);
        const reservationRepository = new ReservationRepository(tx as Prisma.TransactionClient);

        const inventory = await inventoryRepository.lockByProductWarehouse(
          input.productId,
          input.warehouseId,
        );

        if (!inventory) {
          throw new AppError(HttpStatus.NOT_FOUND, 'Inventory not found');
        }

        const available = inventory.totalQuantity - inventory.reservedQuantity;
        if (available < input.quantity) {
          throw new AppError(HttpStatus.CONFLICT, 'Insufficient inventory');
        }

        await inventoryRepository.reserve(inventory.id, input.quantity);

        return reservationRepository.create({
          userId,
          productId: input.productId,
          warehouseId: input.warehouseId,
          inventoryId: inventory.id,
          quantity: input.quantity,
          expiresAt: new Date(Date.now() + env.RESERVATION_TTL_MINUTES * 60 * 1000),
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }

  async confirmReservation(reservationId: string, userId?: string) {
    return prisma.$transaction(
      async (tx) => {
        const reservationRepository = new ReservationRepository(tx as Prisma.TransactionClient);
        const inventoryRepository = new InventoryRepository(tx as Prisma.TransactionClient);

        const reservation = await reservationRepository.lockById(reservationId);
        if (!reservation || (userId && reservation.userId !== userId)) {
          throw new AppError(HttpStatus.NOT_FOUND, 'Reservation not found');
        }

        if (reservation.status !== ReservationStatus.PENDING) {
          throw new AppError(HttpStatus.CONFLICT, 'Reservation is not pending');
        }

        if (reservation.expiresAt.getTime() <= Date.now()) {
          await inventoryRepository.release(reservation.inventoryId, reservation.quantity);
          await reservationRepository.release(reservation.id);
          throw new AppError(HttpStatus.GONE, 'Reservation expired');
        }

        await inventoryRepository.consumeConfirmed(reservation.inventoryId, reservation.quantity);
        return reservationRepository.confirm(reservation.id);
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }

  async releaseReservation(reservationId: string, userId?: string) {
    return prisma.$transaction(
      async (tx) => {
        const reservationRepository = new ReservationRepository(tx as Prisma.TransactionClient);
        const inventoryRepository = new InventoryRepository(tx as Prisma.TransactionClient);

        const reservation = await reservationRepository.lockById(reservationId);
        if (!reservation || (userId && reservation.userId !== userId)) {
          throw new AppError(HttpStatus.NOT_FOUND, 'Reservation not found');
        }

        if (reservation.status !== ReservationStatus.PENDING) {
          return reservation;
        }

        await inventoryRepository.release(reservation.inventoryId, reservation.quantity);
        return reservationRepository.release(reservation.id);
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }

  async releaseExpiredReservations() {
    return prisma.$transaction(
      async (tx) => {
        const expired = await tx.$queryRaw<Array<{ id: string }>>`
          SELECT id
          FROM "Reservation"
          WHERE status = 'PENDING'::"ReservationStatus"
            AND "expiresAt" <= now()
          ORDER BY "expiresAt" ASC
          LIMIT 500
          FOR UPDATE SKIP LOCKED
        `;

        for (const item of expired) {
          const reservation = await tx.reservation.findUnique({
            where: { id: item.id },
            select: { id: true, inventoryId: true, quantity: true, status: true },
          });

          if (!reservation || reservation.status !== ReservationStatus.PENDING) {
            continue;
          }

          await tx.inventory.update({
            where: { id: reservation.inventoryId },
            data: { reservedQuantity: { decrement: reservation.quantity } },
          });
          await tx.reservation.update({
            where: { id: reservation.id },
            data: { status: ReservationStatus.RELEASED, releasedAt: new Date() },
          });
        }

        return expired.length;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }
}
