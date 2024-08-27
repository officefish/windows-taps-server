import { Module } from '@nestjs/common'
import { PrismaModule } from '@/modules/prisma//prisma.module'
import { AppConfigModule } from '@/modules/config/config.module'
import { SentryModule } from '@sentry/nestjs/setup'
import { PingPongModule } from '@/modules/rest/ping-pong/ping-pong.module'


@Module({
  imports: [
    PrismaModule,
    AppConfigModule,
    SentryModule.forRoot(),
    PingPongModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
