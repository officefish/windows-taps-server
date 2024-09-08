import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { GameplayService } from './gameplay.service'
import { PrismaModule } from '../prisma/prisma.module'
import { PrismaService } from '../prisma/prisma.service' // Сервис Prisma

@Module({
  imports: [
    ScheduleModule.forRoot(), // Подключаем модуль планировщика
    PrismaModule,
  ],
  providers: [GameplayService, PrismaService],
  exports: [GameplayService],
})
export class GameplayModule {}