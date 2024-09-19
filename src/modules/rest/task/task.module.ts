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
import { AppConfigModule } from '@/modules/config/config.module'
import { AppConfigService } from '@/modules/config/config.service'
import { HttpModule, HttpService } from '@nestjs/axios'

@Module({
  imports: [
   AppConfigModule, 
   PrismaModule,
   PlayerModule,
   TokenModule,
   QuestModule,
   TelegramModule,
   HttpModule,
  ],
  controllers : [TaskController],
  providers: [PrismaService, TaskService, QuestService, TelegramService, AppConfigService],
})
export class TaskModule {}