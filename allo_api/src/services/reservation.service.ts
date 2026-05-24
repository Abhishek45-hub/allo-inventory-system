import { Prisma, ReservationStatus } from '@prisma/client';
import { env } from '@/config/env';
import { prisma } from '@/database/prisma';
import { HttpStatus } from '@/constants/http-status';
import { AppError } from '@/utils/app-error';
import { InventoryRepository } from '@/repositories/inventory.repository';
import { ReservationRepository } from '@/repositories/reservation.repository';

export class ReservationService {
  private static readonly SERIALIZABLE_RETRY_LIMIT = 3;

  private isSerializationConflict(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034';
  }

  private async runSerializable<T>(
    operation: (tx: Prisma.TransactionClient) => Promise<T>,
    conflictMessage: string,
  ): Promise<T> {
    for (let attempt = 0; attempt < ReservationService.SERIALIZABLE_RETRY_LIMIT; attempt += 1) {
      try {
        return await prisma.$transaction(
          async (tx) => operation(tx as Prisma.TransactionClient),
          {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          },
        );
      } catch (error) {
        if (this.isSerializationConflict(error)) {
          if (attempt === ReservationService.SERIALIZABLE_RETRY_LIMIT - 1) {
            throw new AppError(HttpStatus.CONFLICT, conflictMessage);
          }
          continue;
        }
        throw error;
      }
    }

    throw new AppError(HttpStatus.CONFLICT, conflictMessage);
  }

  private async releaseExpiredForInventory(
    tx: Prisma.TransactionClient,
    inventoryId: string,
  ): Promise<number> {
    const expired = await tx.$queryRaw<Array<{ id: string; quantity: number }>>`
      SELECT id, quantity
      FROM "Reservation"
      WHERE status = 'PENDING'::"ReservationStatus"
        AND "inventoryId" = ${inventoryId}::uuid
        AND "expiresAt" <= now()
      ORDER BY "expiresAt" ASC
      FOR UPDATE SKIP LOCKED
    `;

    if (expired.length === 0) {
      return 0;
    }

    const releasedQuantity = expired.reduce((sum, reservation) => sum + reservation.quantity, 0);

    await tx.inventory.update({
      where: { id: inventoryId },
      data: {
        reservedQuantity: { decrement: releasedQuantity },
      },
    });

    await tx.reservation.updateMany({
      where: {
        id: { in: expired.map((reservation) => reservation.id) },
        status: ReservationStatus.PENDING,
      },
      data: {
        status: ReservationStatus.RELEASED,
        releasedAt: new Date(),
      },
    });

    return expired.length;
  }

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
    const userId = await this.resolveUserId(input.userId);

    return this.runSerializable(
      async (tx) => {
        const inventoryRepository = new InventoryRepository(tx);
        const reservationRepository = new ReservationRepository(tx);

        const inventory = await inventoryRepository.lockByProductWarehouse(
          input.productId,
          input.warehouseId,
        );

        if (!inventory) {
          throw new AppError(HttpStatus.NOT_FOUND, 'Inventory not found');
        }

        const releasedCount = await this.releaseExpiredForInventory(tx, inventory.id);
        const lockedInventory = releasedCount > 0
          ? await inventoryRepository.lockByProductWarehouse(input.productId, input.warehouseId)
          : inventory;

        if (!lockedInventory) {
          throw new AppError(HttpStatus.NOT_FOUND, 'Inventory not found');
        }

        const available = lockedInventory.totalQuantity - lockedInventory.reservedQuantity;
        if (available < input.quantity) {
          throw new AppError(HttpStatus.CONFLICT, 'Insufficient inventory');
        }

        const reserveResult = await inventoryRepository.reserve(lockedInventory.id, input.quantity);
        // If the conditional update didn't affect any rows, treat as conflict (insufficient stock)
        if (Array.isArray(reserveResult) && reserveResult.length === 0) {
          throw new AppError(HttpStatus.CONFLICT, 'Insufficient inventory');
        }

        return reservationRepository.create({
          userId,
          productId: input.productId,
          warehouseId: input.warehouseId,
          inventoryId: lockedInventory.id,
          quantity: input.quantity,
          expiresAt: new Date(Date.now() + env.RESERVATION_TTL_MINUTES * 60 * 1000),
        });
      },
      'Reservation conflict detected. Please retry.',
    );
  }

  async confirmReservation(reservationId: string, userId?: string) {
    return this.runSerializable(
      async (tx) => {
        const reservationRepository = new ReservationRepository(tx);
        const inventoryRepository = new InventoryRepository(tx);

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
      'Reservation confirmation conflicted with another update. Please retry.',
    );
  }

  async releaseReservation(reservationId: string, userId?: string) {
    return this.runSerializable(
      async (tx) => {
        const reservationRepository = new ReservationRepository(tx);
        const inventoryRepository = new InventoryRepository(tx);

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
      'Reservation release conflicted with another update. Please retry.',
    );
  }

  async releaseExpiredReservations() {
    return this.runSerializable(
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
      'Expiry release conflicted with another update. Please retry.',
    );
  }

  async cleanupExpiredIdempotencyKeys() {
    const result = await prisma.idempotencyKey.deleteMany({
      where: {
        expiresAt: {
          lte: new Date(),
        },
      },
    });

    return result.count;
  }
}
