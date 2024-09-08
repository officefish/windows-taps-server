import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { QuestService } from './quest.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Player } from '@/common/decorators';
import { FastifyRequest, FastifyReply } from 'fastify'; // Импорт FastifyRequest
import { PlayerGuard } from '@/modules/rest/player/guards/player.guard'
import { DailyRewardInfoResponse, DailyRewardResponse } from './responses';


@ApiTags('quest')
@Controller('quest')
export class QuestController {
  constructor(private readonly quest: QuestService) {}

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

}


