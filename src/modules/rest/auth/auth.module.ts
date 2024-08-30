import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
//import { TokenModule } from '../token/token.module'
//import { ReferralsModule } from '../referrals/referrals.module'

@Module({
  imports: [],//[TokenModule, ReferralsModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}