import { prisma } from '@/database/prisma';

export class ProductRepository {
  listWithInventory() {
    return prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        inventories: {
          include: { warehouse: true },
        },
      },
    });
  }
}
