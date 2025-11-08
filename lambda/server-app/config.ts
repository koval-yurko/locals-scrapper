import path from 'path';
import dotenv from 'dotenv';
import { cleanEnv, num, str } from 'envalid';

const envPath = path.resolve(__dirname, './.env');
dotenv.config({ path: [envPath], encoding: 'utf-8' });

export const config = cleanEnv(process.env, {
  PORT: num({ default: 3000 }),
  BASE_URL: str({ devDefault: '/api' }),
  DATABASE_URL: str({
    devDefault: 'postgresql://test:test@localhost:5434/locals-scrapper',
  }),
  AWS_REGION: str({ default: 'eu-central-1' }),
  AWS_SQS_USER_SCAN_QUEUE_URL: str({
    devDefault:
      'http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/user-scan',
  }),
  LOCALS_ACCESS_TOKEN: str(),
  SUPABASE_JWT_SECRET: str(),
  VALID_API_KEYS: str(),
  // AWS_SQS_USER_SCAN_GO_QUEUE_URL: str({
  //   devDefault:
  //     'http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/user-scan-go',
  // }),
  // BOOL: bool({ devDefault: true }),
  // NUM: num({ devDefault: 180 }),
});
