import { config } from 'dotenv';
config({ path: '.env.local' });
import { isDbConfigured } from '../src/lib/prisma';

console.log('isDbConfigured:', isDbConfigured);
