import { Module } from '@nestjs/common'
import { AppConfigModule } from '@/modules/config/config.module'
import { AppConfigService } from '@/modules/config/config.service'
import { TelegramService } from './telegram.service'
import { HttpModule, HttpService } from '@nestjs/axios';  // Импортируем HttpModule


@Module({
    imports: [
        AppConfigModule,
        HttpModule
      ],
  providers: [TelegramService, AppConfigService, HttpService],
  exports: [TelegramService],
})
export class TelegramModule {}