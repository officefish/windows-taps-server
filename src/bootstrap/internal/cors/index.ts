import { INestApplication, Logger } from '@nestjs/common'
import fastifyCors, { FastifyCorsOptions } from '@fastify/cors'
//import { localhostCorsConfig } from './config'

export function initializeCors(app: INestApplication) {
  if (process.env.NODE_ENV === 'development') {
    //app.enableCors(localhostCorsConfig)

    const server = app.getHttpAdapter().getInstance()

    server.register(fastifyCors, {
      hook: 'preHandler',
      delegator: (req, callback) => {
        const corsOptions: FastifyCorsOptions = {
          // disable all
          origin: false,
          credentials: true,
          preflightContinue: true,
          methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        }

        // include CORS headers for requests from localhost
        if (/localhost/.test(req.headers.origin)) {
          corsOptions.origin = true
        }

        // callback expects two parameters: error and options
        callback(null, corsOptions)
      },
    })

    Logger.log('CORS initialized', 'Bootstrap')
  }
}