import { Module } from '@nestjs/common'
import { AppConfigModule } from '@/modules/config/config.module'
import { AppConfigService } from '@/modules/config/config.service'
import { TelegramService } from './telegram.service'

@Module({
    imports: [
        AppConfigModule,
      ],
  providers: [TelegramService, AppConfigService],
  exports: [TelegramService],
})
export class TelegramModule {}