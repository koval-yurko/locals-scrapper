import path from 'path';
import dotenv from 'dotenv';
import { cleanEnv, num, str } from 'envalid';

const envPath = path.resolve(__dirname, './.env');
dotenv.config({ path: [envPath], encoding: 'utf-8' });

export const config = cleanEnv(process.env, {
  DATABASE_URL: str({
    devDefault: 'postgresql://test:test@localhost:5434/locals-scrapper',
  }),
  LOCALS_ACCESS_TOKEN: str(),
  // BOOL: bool({ devDefault: true }),
  // NUM: num({ devDefault: 180 }),
});
