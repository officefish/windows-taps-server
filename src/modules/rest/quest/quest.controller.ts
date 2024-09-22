import { Body, Controller, NotFoundException, Post, Req, Res, UseGuards } from '@nestjs/common';
import { QuestService } from './quest.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Player } from '@/common/decorators';
import { FastifyRequest, FastifyReply } from 'fastify'; // Импорт FastifyRequest
import { PlayerGuard } from '@/modules/rest/player/guards/player.guard'
import { DailyRewardInfoResponse, DailyRewardResponse, MinigameInfoResponse, QuestInfoResponse } from './responses';
import { PrismaService } from '@/modules/prisma/prisma.service';


@ApiTags('quest')
@Controller('quest')
export class QuestController {
  constructor(
    private readonly quest: QuestService,
    private readonly prisma: PrismaService
  ) {}

  @ApiResponse({
    status: 200,
    description: 'Player successfully energy update',
    type: DailyRewardResponse,
  })
  @UseGuards(PlayerGuard)
  @Post('daily-reward')
  @Player()
  async claimDailyReward(
    @Body() body: {energy: number},
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply
  ) {
    const { tgId } = req.currentUser
    const data = await this.quest.claimDailyReward(tgId);
    return reply.type('application/json').send(data);
  }

  @ApiResponse({
    status: 200,
    description: 'Player successfully energy update',
    type: DailyRewardInfoResponse,
  })
  @UseGuards(PlayerGuard)
  @Post('daily-reward/info')
  @Player()
  async getDailyRewardInfo(
    @Body() body: {energy: number},
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply
  ) {
    const { tgId } = req.currentUser
    const player = await this.prisma.player.findUnique({ where: { tgId }})
    if (!player) {
      throw new NotFoundException('User not found');
    }
    const data = await this.quest.getDailyRewardInfo(player);
    return reply.type('application/json').send(data);
  }

  @ApiResponse({
    status: 200,
    description: 'Player successfully tried to play minigame',
    type: DailyRewardResponse,
  })
  @UseGuards(PlayerGuard)
  @Post('minigame')
  @Player()
  async playMiniGame(
    @Body() body: {win: boolean, combination?: string, steps?: string},
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply
  ) {
    const { tgId } = req.currentUser
    const player = await this.prisma.player.findUnique({ where: { tgId }})
    if (!player) {
      throw new NotFoundException('User not found');
    }

    const data = await this.quest.playMiniGame(player, body);
    return reply.type('application/json').send(data);
  }

  @ApiResponse({
    status: 200,
    description: 'Player get both daily reward and minigame info',
    type: MinigameInfoResponse,
  })
  @UseGuards(PlayerGuard)
  @Post('minigame/info')
  @Player()
  async getMinigameInfo(
    @Body() body: {energy?: number},
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply
  ) {

    const { tgId } = req.currentUser
    const player = await this.prisma.player.findUnique({ where: { tgId }})
    if (!player) {
      throw new NotFoundException('User not found');
    }

    const minigame = await this.quest.isGameAvailable(player);
    return reply.type('application/json').send({
      minigame
    });
  }

  @ApiResponse({
    status: 200,
    description: 'Player get both daily reward and minigame info',
    type: QuestInfoResponse,
  })
  @UseGuards(PlayerGuard)
  @Post('info')
  @Player()
  async getQuestInfo(
    @Body() body: {energy?: number},
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply
  ) {

    const { tgId } = req.currentUser
    const player = await this.prisma.player.findUnique({ where: { tgId }})
    if (!player) {
      throw new NotFoundException('User not found');
    }

    const dailyReward = await this.quest.getDailyRewardInfo(player);
    const minigame = await this.quest.isGameAvailable(player);
    return reply.type('application/json').send({
      dailyReward,
      minigame
    });
  }

}


