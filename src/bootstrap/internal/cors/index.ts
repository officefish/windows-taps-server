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
          allowedHeaders: ['Content-Type', 'Authorization'],
          methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        }

        const allowedOrigins = [
          'https://web.telegram.org', // Домен Web Telegram App
          'http://localhost:8001', 
          'http://localhost:3000', 
          'https://localhost:8001', 
          'https://localhost:3000', 
          'https://windows-taps-pewz.vercel.app',
          // Домен для локальной разработки, если нужно
          // Можно добавить другие домены, если требуется
        ];
        // Проверяем заголовок Origin
        if (allowedOrigins.includes(req.headers.origin || '')) {
          corsOptions.origin = true;
        }
    

        // // include CORS headers for requests from localhost
        if (/localhost/.test(req.headers.origin)) {
           corsOptions.origin = true
        }

        // callback expects two parameters: error and options
        callback(null, corsOptions)
      },
    })

    // Обработка preflight OPTIONS запросов
    server.addHook('preHandler', (req, reply, done) => {
      if (req.method === 'OPTIONS') {
        reply
          .header('Access-Control-Allow-Origin', 'https://windows-taps-pewz.vercel.app')
          .header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
          .header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
          .status(204)
          .send();
      } else {
        done();
      }
    });

    Logger.log('CORS initialized', 'Bootstrap')
  }
}