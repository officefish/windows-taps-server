import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { TokenModule } from '@/modules/token/token.module'
import { ReferralsModule } from '../referrals/referrals.module'
import { AppConfigModule } from '@/modules/config/config.module'
import { TelegramModule } from '@/modules/telegram/telegram.module'

@Module({
  imports: [TokenModule, ReferralsModule, AppConfigModule, TelegramModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}