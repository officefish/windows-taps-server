import { Module } from '@nestjs/common'
import { PrismaModule } from '@/modules/prisma//prisma.module'
import { AppConfigModule } from '@/modules/config/config.module'
import { SentryModule } from '@sentry/nestjs/setup'
import { PingPongModule } from '@/modules/rest/ping-pong/ping-pong.module'
import { AuthModule } from '@/modules/rest/auth/auth.module'
import { TelegramModule } from '@/modules/telegram/telegram.module'
import { GameplayModule } from '@/modules/gameplay/gameplay.module'
import { PlayerModule } from '@/modules/rest/player/player.module'
import { QuestModule } from '@/modules/rest/quest/quest.module'
import { ShopModule } from '@/modules/rest/shop/shop.module'

import { APP_FILTER } from "@nestjs/core";
import { SentryGlobalFilter } from "@sentry/nestjs/setup";

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
    QuestModule,
    ShopModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
  ],
})
export class AppModule {}
