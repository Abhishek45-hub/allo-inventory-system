import { UserRole } from '@prisma/client';
import { prisma } from '@/database/prisma';
import { PasswordProvider } from '@/providers/password.provider';

const passwordProvider = new PasswordProvider();

const main = async () => {
  const warehouse = await prisma.warehouse.upsert({
    where: { code: 'WH-001' },
    update: {},
    create: { code: 'WH-001', name: 'Primary Warehouse', location: 'Bengaluru' },
  });

  const product = await prisma.product.upsert({
    where: { sku: 'ALLO-RESERVE-001' },
    update: {},
    create: { sku: 'ALLO-RESERVE-001', name: 'Allo Smart Device', description: 'Primary SKU' },
  });

  await prisma.inventory.upsert({
    where: { productId_warehouseId: { productId: product.id, warehouseId: warehouse.id } },
    update: { totalQuantity: 50 },
    create: {
      productId: product.id,
      warehouseId: warehouse.id,
      totalQuantity: 50,
      reservedQuantity: 0,
    },
  });

  await prisma.user.upsert({
    where: { email: 'operator@allo.com' },
    update: {},
    create: {
      email: 'operator@allo.com',
      fullName: 'Allo Operator',
      role: UserRole.OPERATOR,
      passwordHash: await passwordProvider.hash('Password@123'),
    },
  });

  await prisma.user.upsert({
    where: { email: 'customer@allo.com' },
    update: {},
    create: {
      email: 'customer@allo.com',
      fullName: 'Allo Customer',
      role: UserRole.CUSTOMER,
      passwordHash: await passwordProvider.hash('Password@123'),
    },
  });
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
