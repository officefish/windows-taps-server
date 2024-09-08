import { Module } from '@nestjs/common'
import { GameplayModule } from '@/modules/gameplay/gameplay.module'
import { GameplayService } from '@/modules/gameplay/gameplay.service'
import { PlayerController } from './player.controller'
import { TokenModule } from '@/modules/token/token.module'

@Module({
  imports: [
   GameplayModule,
   TokenModule,
  ],
  controllers : [PlayerController],
  providers: [GameplayService],
})
export class PlayerModule {}