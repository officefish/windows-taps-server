import { Module } from '@nestjs/common'
import { PrismaModule } from '@/modules/prisma/prisma.module'
import { PrismaService } from '@/modules/prisma/prisma.service'
import { PlayerModule } from '../player/player.module'
import { TokenModule } from '@/modules/token/token.module'
import { TaskController } from './task.controller'
import { TaskService } from './task.service'
import { QuestModule } from '../quest/quest.module'
import { QuestService } from '../quest/quest.service'
import { TelegramModule } from '@/modules/telegram/telegram.module'
import { TelegramService } from '@/modules/telegram/telegram.service'

@Module({
  imports: [
   PrismaModule,
   PlayerModule,
   TokenModule,
   QuestModule,
   TelegramModule
  ],
  controllers : [TaskController],
  providers: [PrismaService, TaskService, QuestService, TelegramService],
})
export class TaskModule {}