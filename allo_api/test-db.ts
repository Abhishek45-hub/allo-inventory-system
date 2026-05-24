import { PrismaClient } from '@prisma/client';

const users = ['postgres', 'Abhishek', 'admin'];
const passwords = ['', 'postgres', 'root', 'password', '123456', 'admin'];

async function testPasswords() {
  for (const user of users) {
    for (const pw of passwords) {
      const auth = pw ? `:${pw}` : '';
      const url = `postgresql://${user}${auth}@localhost:5432/allo_inventory`;
      const prisma = new PrismaClient({ datasources: { db: { url } } });
      try {
        await prisma.$connect();
        console.log(`Success with url: "${url}"`);
        await prisma.$disconnect();
        return;
      } catch (e: any) {
        // ignore
      }
    }
  }
  console.log('None worked.');
}

testPasswords();
