import { Module } from '@nestjs/common'
import { PrismaModule } from '@/modules/prisma/prisma.module'
import { PrismaService } from '@/modules/prisma/prisma.service'
import { PlayerModule } from '../player/player.module'
import { TokenModule } from '@/modules/token/token.module'
import { TaskController } from './task.controller'
import { TaskService } from './task.service'

@Module({
  imports: [
   PrismaModule,
   PlayerModule,
   TokenModule,
  ],
  controllers : [TaskController],
  providers: [PrismaService, TaskService],
})
export class TaskModule {}