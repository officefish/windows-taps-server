import { NestFactory } from '@nestjs/core'
import { AppModule } from './app/app.module'
import { NestFastifyApplication, FastifyAdapter } from '@nestjs/platform-fastify'
import { initializeCors, initializeStaticAssets, initializeSwagger } from './bootstrap'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  )
  // Set global prefix for api
  app.setGlobalPrefix('/api/v1')

  /* installation of auxiliary modules */
  initializeCors(app)
  initializeStaticAssets(app)
  initializeSwagger(app)


  /* start server */
  await app.listen(8001)
}
bootstrap()
