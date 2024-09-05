import { Module } from '@nestjs/common'
import { ReferralsService } from './referrals.service'
import { ReferralsController } from './referrals.controller'
import { ConfigModule, ConfigService } from '@nestjs/config'

@Module({
  imports: [ConfigModule],
  controllers: [ReferralsController],
  providers: [ReferralsService, ConfigService],
  exports: [ReferralsService],
})
export class ReferralsModule {}