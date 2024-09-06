import { Module } from '@nestjs/common'
import { GameplayModule } from '@/modules/gameplay/gameplay.module'
import { GameplayService } from '@/modules/gameplay/gameplay.service'
import { PlayerController } from './player.controller'

@Module({
  imports: [
   GameplayModule
  ],
  controllers : [PlayerController],
  providers: [GameplayService],
})
export class PlayerModule {}