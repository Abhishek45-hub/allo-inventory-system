import { prisma } from '@/database/prisma';
import { ReservationService } from '@/services/reservation.service';
import { PasswordProvider } from '@/providers/password.provider';

describe('concurrency reservations', () => {
  const service = new ReservationService();
  const passwordProvider = new PasswordProvider();
  let dbReady = true;
  let userId = '';
  let productId = '';
  let warehouseId = '';

  beforeAll(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbReady = false;
      return;
    }

    const user = await prisma.user.upsert({
      where: { email: 'concurrency@allo.test' },
      update: {},
      create: {
        email: 'concurrency@allo.test',
        fullName: 'Concurrency Test User',
        role: 'CUSTOMER',
        passwordHash: await passwordProvider.hash('Password@123'),
      },
    });
    const product = await prisma.product.upsert({
      where: { sku: 'CONCURRENCY-001' },
      update: {},
      create: { sku: 'CONCURRENCY-001', name: 'Concurrency Test Product' },
    });
    const warehouse = await prisma.warehouse.upsert({
      where: { code: 'WH-CONCURRENCY' },
      update: {},
      create: { code: 'WH-CONCURRENCY', name: 'Concurrency Warehouse', location: 'Test' },
    });

    userId = user.id;
    productId = product.id;
    warehouseId = warehouse.id;

    await prisma.reservation.deleteMany({ where: { productId, warehouseId } });

    const inv = await prisma.inventory.upsert({
      where: { productId_warehouseId: { productId, warehouseId } },
      update: { totalQuantity: 1, reservedQuantity: 0 },
      create: { productId, warehouseId, totalQuantity: 1, reservedQuantity: 0 },
    });

    if (!inv) {
      throw new Error('Inventory missing');
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('only one reservation succeeds for last unit', async () => {
    if (!dbReady) {
      console.warn('Skipping DB-backed concurrency test because DATABASE_URL is not reachable.');
      expect(dbReady).toBe(false);
      return;
    }

    const attempt = () =>
      service
        .createReservation({ userId, productId, warehouseId, quantity: 1 })
        .then(() => ({ ok: true as const }))
        .catch((err: Error) => ({ ok: false as const, message: err.message }));

    const [first, second] = await Promise.all([attempt(), attempt()]);
    const successCount = [first, second].filter((r) => r.ok).length;

    expect(successCount).toBe(1);
  });
});
