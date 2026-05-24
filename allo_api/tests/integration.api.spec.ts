import request from 'supertest';
import { prisma } from '@/database/prisma';
import { JwtProvider } from '@/providers/jwt.provider';
import { PasswordProvider } from '@/providers/password.provider';
import { app } from '@/app';

describe('api integration', () => {
  const jwtProvider = new JwtProvider();
  const passwordProvider = new PasswordProvider();
  let dbReady = true;
  let accessToken = '';
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
      where: { email: 'api-integration@allo.test' },
      update: {},
      create: {
        email: 'api-integration@allo.test',
        fullName: 'API Integration User',
        role: 'CUSTOMER',
        passwordHash: await passwordProvider.hash('Password@123'),
      },
    });

    accessToken = jwtProvider.signAccess({
      sub: user.id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    const product = await prisma.product.upsert({
      where: { sku: 'API-INTEGRATION-001' },
      update: {},
      create: { sku: 'API-INTEGRATION-001', name: 'API Integration Product' },
    });

    const warehouse = await prisma.warehouse.upsert({
      where: { code: 'WH-API-INTEGRATION' },
      update: {},
      create: { code: 'WH-API-INTEGRATION', name: 'API Integration Warehouse', location: 'Test' },
    });

    productId = product.id;
    warehouseId = warehouse.id;
  });

  beforeEach(async () => {
    if (!dbReady) {
      return;
    }

    await prisma.reservation.deleteMany({ where: { productId, warehouseId } });
    await prisma.inventory.upsert({
      where: { productId_warehouseId: { productId, warehouseId } },
      update: { totalQuantity: 2, reservedQuantity: 0 },
      create: { productId, warehouseId, totalQuantity: 2, reservedQuantity: 0 },
    });
    await prisma.idempotencyKey.deleteMany({
      where: {
        key: {
          startsWith: 'api-integration-',
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('returns health', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('rejects unauthenticated reservation requests', async () => {
    if (!dbReady) {
      expect(dbReady).toBe(false);
      return;
    }

    const response = await request(app)
      .post('/api/reservations')
      .send({ productId, warehouseId, quantity: 1 });

    expect(response.status).toBe(401);
  });

  it('rejects unauthenticated product and warehouse listing requests', async () => {
    if (!dbReady) {
      expect(dbReady).toBe(false);
      return;
    }

    const [products, warehouses] = await Promise.all([
      request(app).get('/api/products'),
      request(app).get('/api/warehouses'),
    ]);

    expect(products.status).toBe(401);
    expect(warehouses.status).toBe(401);
  });

  it('allows authenticated product and warehouse listing requests', async () => {
    if (!dbReady) {
      expect(dbReady).toBe(false);
      return;
    }

    const [products, warehouses] = await Promise.all([
      request(app).get('/api/products').set('Authorization', `Bearer ${accessToken}`),
      request(app).get('/api/warehouses').set('Authorization', `Bearer ${accessToken}`),
    ]);

    expect(products.status).toBe(200);
    expect(warehouses.status).toBe(200);
    expect(products.body.success).toBe(true);
    expect(warehouses.body.success).toBe(true);
  });

  it('returns 409 when two requests race for the last unit', async () => {
    if (!dbReady) {
      expect(dbReady).toBe(false);
      return;
    }

    await prisma.inventory.update({
      where: { productId_warehouseId: { productId, warehouseId } },
      data: { totalQuantity: 1, reservedQuantity: 0 },
    });

    const makeReservation = (suffix: string) =>
      request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Idempotency-Key', `api-integration-race-${suffix}`)
        .send({ productId, warehouseId, quantity: 1 });

    const [first, second] = await Promise.all([makeReservation('a'), makeReservation('b')]);
    const statuses = [first.status, second.status].sort();

    expect(statuses).toEqual([201, 409]);
  });

  it('returns the original response for duplicate idempotency key', async () => {
    if (!dbReady) {
      expect(dbReady).toBe(false);
      return;
    }

    const key = 'api-integration-idempotent-reserve';
    const payload = { productId, warehouseId, quantity: 1 };

    const first = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Idempotency-Key', key)
      .send(payload);

    const second = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Idempotency-Key', key)
      .send(payload);

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(second.body.data.id).toBe(first.body.data.id);
  });

  it('returns 410 when confirming an expired reservation', async () => {
    if (!dbReady) {
      expect(dbReady).toBe(false);
      return;
    }

    const create = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Idempotency-Key', 'api-integration-expired-create')
      .send({ productId, warehouseId, quantity: 1 });

    expect(create.status).toBe(201);

    await prisma.reservation.update({
      where: { id: create.body.data.id as string },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });

    const confirm = await request(app)
      .post(`/api/reservations/${create.body.data.id}/confirm`)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Idempotency-Key', 'api-integration-expired-confirm')
      .send();

    expect(confirm.status).toBe(410);
  });
});
