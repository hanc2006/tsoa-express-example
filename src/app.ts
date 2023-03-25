import express, { json, urlencoded } from 'express'
import { RegisterRoutes } from './Routes/routes'
import swaggerUI from 'swagger-ui-express'
import swaggerJson from './Routes/swagger.json'

export const app = express()

app.use(
  urlencoded({
    extended: true,
  })
)
app.use(json())

RegisterRoutes(app)

app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerJson))

app.get('/', (_, res) => {
  res.json('Welcome to your Tsoa-Express-Swagger app')
})
