import path from 'path';
import dotenv from 'dotenv';
import { cleanEnv, num, str } from 'envalid';

const envPath = path.resolve(__dirname, './.env');
dotenv.config({ path: [envPath], encoding: 'utf-8' });

export const config = cleanEnv(process.env, {
  CDK_DEFAULT_ACCOUNT: str(),
  CDK_DEFAULT_REGION: str(),
  DOMAIN_NAME: str(),
  HOSTED_ZONE_ID: str(),
  CERTIFICATE_ARN: str(),
  DATABASE_DEV_URL: str(),
  DATABASE_PROD_URL: str(),
  LOCALS_ACCESS_TOKEN: str(),
  VALID_API_KEYS: str(),
  SUPABASE_JWT_SECRET: str(),
  // BOOL: bool({ devDefault: true }),
  // NUM: num({ devDefault: 180 }),
});
