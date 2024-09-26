import { Controller, Get, Param, HttpException, HttpStatus, UseGuards, Post, Req, Logger, Body, NotFoundException } from '@nestjs/common';
import { PlayerGuard } from '../player/guards/player.guard';
import { Player } from '@/common/decorators';
import { FastifyRequest, FastifyReply } from 'fastify'; // Импорт FastifyRequest
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { TaskService } from './task.service';
import { PrismaService } from '@/modules/prisma/prisma.service';

@ApiTags('tasks')
@Controller('tasks')
export class TaskController {
  
  constructor(
    private readonly service: TaskService,
    private readonly prisma: PrismaService
  ) {}

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

  @UseGuards(PlayerGuard)
  @Post('check')
  @Player()
  async checkTasksForPlayer(
    @Req() req: FastifyRequest,
  ) {
    // Получаем игрока и его предметы
    const { tgId } = req.currentUser

    /* Player */     
    const player = await this.prisma.player.findUnique({ where: { tgId }})
    if (!player) {
      throw new NotFoundException('User not found');
    }

    return await this.service.checkCurrentTaskStatus(player)
  }

  @UseGuards(PlayerGuard)
  @Post('baunty')
  @Player()
  async getTaskBaunty(
    @Body() body: {taskId?: string},
    @Req() req: FastifyRequest,
  ) {
    // Получаем игрока и его предметы
    const { tgId } = req.currentUser
    const { taskId } = body

    /* Player */     
    const player = await this.prisma.player.findUnique({ where: { tgId }})
    if (!player) {
      throw new NotFoundException('User not found');
    }

    return await this.service.getTaskBaunty(player, taskId)

    
  }


}