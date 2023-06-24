import express, { json, urlencoded } from 'express'
import { RegisterRoutes } from './routes/routes'
import swaggerUI from 'swagger-ui-express'
// import { generateJsonSchema } from 'ts-decorator-json-schema-generator/lib/esm';
// import swaggerJson from './routes/swagger.json' assert {  type: 'json' };
import swaggerJson from './routes/swagger.json';
// import { User } from './models/TestModel';

export const app = express();

// const model = generateJsonSchema(User, { includeSubschemas: 'reference' });
// console.log(JSON.stringify(model));

app.use(
  urlencoded({
    extended: true,
  })
);
app.use(json());

RegisterRoutes(app);

app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerJson))

app.get('/', (_, res) => {
  res.json('Welcome to your Tsoa-Express-Swagger app')
});
