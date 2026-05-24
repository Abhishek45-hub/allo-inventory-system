import { ReservationStatus, type Prisma, type PrismaClient } from '@prisma/client';

export class ReservationRepository {
  constructor(private readonly db: PrismaClient | Prisma.TransactionClient) {}

  create(input: {
    userId: string;
    productId: string;
    warehouseId: string;
    inventoryId: string;
    quantity: number;
    expiresAt: Date;
  }) {
    return this.db.reservation.create({ data: input });
  }

  findById(id: string) {
    return this.db.reservation.findUnique({ where: { id } });
  }

  async lockById(id: string) {
    const rows = await this.db.$queryRaw<Array<{
      id: string;
      userId: string;
      productId: string;
      warehouseId: string;
      inventoryId: string;
      quantity: number;
      status: ReservationStatus;
      expiresAt: Date;
      confirmedAt: Date | null;
      releasedAt: Date | null;
      createdAt: Date;
      updatedAt: Date;
    }>>`
      SELECT *
      FROM "Reservation"
      WHERE id = ${id}::uuid
      FOR UPDATE
    `;

    return rows[0] ?? null;
  }

  confirm(id: string) {
    return this.db.reservation.update({
      where: { id },
      data: {
        status: ReservationStatus.CONFIRMED,
        confirmedAt: new Date(),
      },
    });
  }

  release(id: string) {
    return this.db.reservation.update({
      where: { id },
      data: {
        status: ReservationStatus.RELEASED,
        releasedAt: new Date(),
      },
    });
  }
}
