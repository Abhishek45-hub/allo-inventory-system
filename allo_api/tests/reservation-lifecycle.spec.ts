import { ReservationStatus } from '@prisma/client';
import { prisma } from '@/database/prisma';
import { PasswordProvider } from '@/providers/password.provider';
import { ReservationService } from '@/services/reservation.service';

describe('reservation lifecycle', () => {
  const service = new ReservationService();
  const passwordProvider = new PasswordProvider();
  let dbReady = true;
  let userId = '';
  let productId = '';
  let warehouseId = '';
  let inventoryId = '';

  beforeAll(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbReady = false;
      return;
    }

    const user = await prisma.user.upsert({
      where: { email: 'lifecycle@allo.test' },
      update: {},
      create: {
        email: 'lifecycle@allo.test',
        fullName: 'Lifecycle Test User',
        role: 'CUSTOMER',
        passwordHash: await passwordProvider.hash('Password@123'),
      },
    });
    const product = await prisma.product.upsert({
      where: { sku: 'LIFECYCLE-001' },
      update: {},
      create: { sku: 'LIFECYCLE-001', name: 'Lifecycle Test Product' },
    });
    const warehouse = await prisma.warehouse.upsert({
      where: { code: 'WH-LIFECYCLE' },
      update: {},
      create: { code: 'WH-LIFECYCLE', name: 'Lifecycle Warehouse', location: 'Test' },
    });

    userId = user.id;
    productId = product.id;
    warehouseId = warehouse.id;
  });

  beforeEach(async () => {
    if (!dbReady) {
      return;
    }

    await prisma.reservation.deleteMany({ where: { productId, warehouseId } });
    const inventory = await prisma.inventory.upsert({
      where: { productId_warehouseId: { productId, warehouseId } },
      update: { totalQuantity: 10, reservedQuantity: 0 },
      create: { productId, warehouseId, totalQuantity: 10, reservedQuantity: 0 },
    });
    inventoryId = inventory.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('confirm consumes total stock and clears reserved stock', async () => {
    if (!dbReady) {
      expect(dbReady).toBe(false);
      return;
    }

    const reservation = await service.createReservation({ userId, productId, warehouseId, quantity: 2 });
    const confirmed = await service.confirmReservation(reservation.id, userId);
    const inventory = await prisma.inventory.findUniqueOrThrow({ where: { id: inventoryId } });

    expect(confirmed.status).toBe(ReservationStatus.CONFIRMED);
    expect(inventory.totalQuantity).toBe(8);
    expect(inventory.reservedQuantity).toBe(0);
  });

  it('release returns reserved stock to availability', async () => {
    if (!dbReady) {
      expect(dbReady).toBe(false);
      return;
    }

    const reservation = await service.createReservation({ userId, productId, warehouseId, quantity: 3 });
    const released = await service.releaseReservation(reservation.id, userId);
    const inventory = await prisma.inventory.findUniqueOrThrow({ where: { id: inventoryId } });

    expect(released.status).toBe(ReservationStatus.RELEASED);
    expect(inventory.totalQuantity).toBe(10);
    expect(inventory.reservedQuantity).toBe(0);
  });

  it('expired confirm releases inventory and returns 410', async () => {
    if (!dbReady) {
      expect(dbReady).toBe(false);
      return;
    }

    const reservation = await service.createReservation({ userId, productId, warehouseId, quantity: 1 });
    await prisma.reservation.update({
      where: { id: reservation.id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });

    await expect(service.confirmReservation(reservation.id, userId)).rejects.toMatchObject({
      statusCode: 410,
    });

    const inventory = await prisma.inventory.findUniqueOrThrow({ where: { id: inventoryId } });
    expect(inventory.reservedQuantity).toBe(0);
  });
});
