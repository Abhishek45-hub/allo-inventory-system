import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: '.env' });

// Define required env vars
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
});

try {
  envSchema.parse(process.env);
} catch (e) {
  console.error('❌ Environment validation failed:', e.errors ?? e);
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  try {
    // Simple query to verify connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
