import { Module } from '@nestjs/common'
import { PrismaModule } from '@/modules/prisma/prisma.module'
import { PrismaService } from '@/modules/prisma/prisma.service'
import { PlayerModule } from '../player/player.module'
import { TokenModule } from '@/modules/token/token.module'
import { ShopController } from './shop.controller'
import { ShopService } from './shop.service'

@Module({
  imports: [
   PrismaModule,
   PlayerModule,
   TokenModule,
  ],
  controllers : [ShopController],
  providers: [PrismaService, ShopService],
})
export class ShopModule {}