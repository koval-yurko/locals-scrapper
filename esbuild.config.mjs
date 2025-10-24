import { build } from 'esbuild';
import { copy } from 'esbuild-plugin-copy';

/**
 * @type {import('esbuild').BuildOptions}
 */
const settings = {
  entryPoints: ['lambda/server-app/index.ts', 'lambda/user-fetch/index.ts'],
  outdir: 'dist/lambda',
  bundle: true,
  format: 'cjs',
  platform: 'node',
  sourcemap: true,
  external: ['aws-lambda', '@aws-sdk/client-sqs'],
  plugins: [
    copy({
      resolveFrom: 'cwd',
      assets: {
        from: ['./shared/repositories/prisma/**/*'],
        to: [
          './dist/lambda/server-app/shared/repositories/prisma',
          './dist/lambda/user-fetch/shared/repositories/prisma',
        ],
      },
    }),
    copy({
      resolveFrom: 'cwd',
      assets: {
        from: ['./lambda/server-app/openapi/swagger.json'],
        to: [
          './dist/lambda/server-app/openapi/',
        ],
      },
    }),
  ],
};

await build(settings);
