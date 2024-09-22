import { Body, Controller, NotFoundException, Post, Req, Res, UseGuards } from '@nestjs/common';
import { QuestService } from './quest.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Player } from '@/common/decorators';
import { FastifyRequest, FastifyReply } from 'fastify'; // Импорт FastifyRequest
import { PlayerGuard } from '@/modules/rest/player/guards/player.guard'
import { DailyRewardInfoResponse, DailyRewardResponse } from './responses';
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
    const data = await this.quest.getDailyRewardInfo(tgId);
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

}


