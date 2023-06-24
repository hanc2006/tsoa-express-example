import { generateRoutes } from '@tsoa/cli';

(async () => {
  await generateRoutes({
    noImplicitAdditionalProperties: 'silently-remove-extras',
    controllerPathGlobs: ["./src/controllers/*Controller.ts"],
    basePath: '/v1',
    entryFile: './src/server.ts',
    routesDir: './src/aws',
    routeGenerator: './src/serverless/routeGenerator.ts',
    modelsTemplate: './src/serverless/models.hbs',
    handlerTemplate: './src/serverless/handler.hbs',
    stackTemplate: './src/serverless/api-stack.hbs',
  })
})();