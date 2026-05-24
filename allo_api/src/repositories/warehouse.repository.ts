import { prisma } from '@/database/prisma';

export class WarehouseRepository {
  list() {
    return prisma.warehouse.findMany({ orderBy: { name: 'asc' } });
  }
}
