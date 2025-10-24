import {
  generateRoutes,
  generateSpec,
  ExtendedRoutesConfig,
  ExtendedSpecConfig,
} from 'tsoa';

const config = {
  basePath: '/api',
  entryFile: 'lambda/server-app/app.ts',
  outputDirectory: './lambda/server-app/openapi',
  noImplicitAdditionalProperties: 'ignore',
  controllerPathGlobs: ['lambda/server-app/controllers/**/*Controller.ts'],
};

(async () => {
  const specOptions: ExtendedSpecConfig = {
    ...config,
    basePath: config.basePath,
    entryFile: config.entryFile,
    outputDirectory: config.outputDirectory,
    noImplicitAdditionalProperties: 'ignore',
    specVersion: 3,
    spec: {
      info: {
        title: 'Locals Scrapper API',
        version: '1.0.0',
      },
    },
  };

  await generateSpec(specOptions);

  const routeOptions: ExtendedRoutesConfig = {
    basePath: config.basePath,
    entryFile: config.entryFile,
    controllerPathGlobs: config.controllerPathGlobs,
    routesDir: 'lambda/server-app/openapi',
    routesFileName: 'routes.ts',
    middleware: 'express',
    noImplicitAdditionalProperties: 'ignore',
    bodyCoercion: true,
    iocModule: 'lambda/server-app/openapi/ioc',
  };

  await generateRoutes(routeOptions);
})();
