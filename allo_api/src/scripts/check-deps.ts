import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: '.env' });

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().optional(),
});

try {
  envSchema.parse(process.env);
} catch (e) {
  console.error('❌ Environment validation failed:', (e as any).errors ?? e);
  process.exit(1);
}

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', (error as any).message ?? error);
    process.exitCode = 2;
  } finally {
    await prisma.$disconnect();
  }
}

async function checkRedis() {
  const url = process.env.REDIS_URL;
  if (!url) {
    console.warn('⚠️  REDIS_URL not set — skipping Redis check');
    return;
  }

  const client = new Redis(url, { lazyConnect: true, retryStrategy: () => null });
  try {
    await client.connect();
    const pong = await client.ping();
    console.log(`✅ Redis connected — PING response: ${pong}`);
  } catch (error) {
    console.error('❌ Unable to connect to Redis:', (error as any).message ?? error);
    process.exitCode = 3;
  } finally {
    try {
      await client.quit();
    } catch {
      client.disconnect();
    }
  }
}

async function main() {
  await checkDatabase();
  await checkRedis();
  if (process.exitCode && process.exitCode !== 0) {
    process.exit(process.exitCode);
  }
  console.log('All dependency checks completed');
}

main();
