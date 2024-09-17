import { Controller, Get, Param, HttpException, HttpStatus, UseGuards, Post, Req, Logger, Body } from '@nestjs/common';
import { PlayerGuard } from '../player/guards/player.guard';
import { Player } from '@/common/decorators';
import { FastifyRequest, FastifyReply } from 'fastify'; // Импорт FastifyRequest
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { TaskService } from './task.service';

@ApiTags('tasks')
@Controller('tasks')
export class TaskController {
  
  constructor(private readonly service: TaskService) {}

  @ApiResponse({
    status: 200,
    description: 'Player items successfully responsed',
    //type: GetItemsForPlayerResponse,
  })

  @UseGuards(PlayerGuard)
  @Post()
  @Player()
  async postTasksForPlayer(
    @Req() req: FastifyRequest,
  ) {
    // Получаем игрока и его предметы
    const { tgId } = req.currentUser

    // Если шаблоны заданий еще не созданы, то создаем их
    await this.service.brootforceCreateTasks()

    return await this.service.getTasksForPlayer(tgId)
  }

}