import { config } from 'dotenv';
config({ path: '.env.local' });
import { db } from '../src/lib/prisma';

async function main() {
  const count = await db.order.count();
  console.log('Order count:', count);
}

main().finally(() => db.$disconnect());
