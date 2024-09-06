import { Module } from '@nestjs/common'
import { PrismaModule } from '@/modules/prisma//prisma.module'
import { AppConfigModule } from '@/modules/config/config.module'
import { SentryModule } from '@sentry/nestjs/setup'
import { PingPongModule } from '@/modules/rest/ping-pong/ping-pong.module'
import { AuthModule } from '@/modules/rest/auth/auth.module'
import { TelegramModule } from '@/modules/telegram/telegram.module'
import { GameplayModule } from '@/modules/gameplay/gameplay.module'
import { PlayerModule } from '@/modules/rest/player/player.module'


@Module({
  imports: [
    PrismaModule,
    AppConfigModule,
    TelegramModule,
    SentryModule.forRoot(),
    PingPongModule,
    AuthModule,
    GameplayModule,
    PlayerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
