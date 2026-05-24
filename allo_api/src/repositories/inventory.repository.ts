import { type Prisma, type PrismaClient } from '@prisma/client';

export class InventoryRepository {
  constructor(private readonly db: PrismaClient | Prisma.TransactionClient) {}

  async lockByProductWarehouse(productId: string, warehouseId: string) {
    const rows = await this.db.$queryRaw<Array<{
      id: string;
      totalQuantity: number;
      reservedQuantity: number;
    }>>`
      SELECT id, "totalQuantity", "reservedQuantity"
      FROM "Inventory"
      WHERE "productId" = ${productId}::uuid AND "warehouseId" = ${warehouseId}::uuid
      FOR UPDATE
    `;

    return rows[0] ?? null;
  }

  reserve(inventoryId: string, quantity: number) {
    // Perform an atomic conditional update as a defensive guard.
    // This updates reservedQuantity only if there is enough available stock.
    return this.db.$queryRaw<Array<{ id: string }>>`
      UPDATE "Inventory"
      SET "reservedQuantity" = "reservedQuantity" + ${quantity}
      WHERE id = ${inventoryId}::uuid
        AND ("totalQuantity" - "reservedQuantity") >= ${quantity}
      RETURNING id
    `;
  }

  release(inventoryId: string, quantity: number) {
    return this.db.inventory.update({
      where: { id: inventoryId },
      data: {
        reservedQuantity: { decrement: quantity },
      },
    });
  }

  consumeConfirmed(inventoryId: string, quantity: number) {
    return this.db.inventory.update({
      where: { id: inventoryId },
      data: {
        totalQuantity: { decrement: quantity },
        reservedQuantity: { decrement: quantity },
      },
    });
  }

  async assertNonNegativeReserved(inventoryId: string) {
    const inventory = await this.db.inventory.findUnique({
      where: { id: inventoryId },
      select: { reservedQuantity: true },
    });

    if (inventory && inventory.reservedQuantity < 0) {
      throw new Error(`Inventory ${inventoryId} reservedQuantity became negative`);
    }
  }
}
