import { Body, Controller, Get, Options, Post, Req, Res, UseGuards } from '@nestjs/common';
import { GameplayService } from '@/modules/gameplay/gameplay.service'
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PlayerEnergyResponse, PlayerFarmResponse } from './responses';
import { Player } from '@/common/decorators';
import { FarmDto } from './dto/farm.dto';
import { FastifyRequest, FastifyReply } from 'fastify'; // Импорт FastifyRequest
import { PlayerGuard } from './guards/player.guard'
import { PlayerIncomeResponse } from './responses/income.response';


@ApiTags('player')
@Controller('player')
export class PlayerController {
  constructor(private readonly gameplay: GameplayService) {}

  @ApiResponse({
    status: 200,
    description: 'Player successfully energy getted',
    type: PlayerEnergyResponse,
  })
  @UseGuards(PlayerGuard)
  @Get('energy')
  @Player()
  async getPlayerEnergy(
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply
  ) {
    const { tgId } = req.currentUser
    console.log('tgId:' + tgId)
    const data = await this.gameplay.updateEnergy(tgId);
    console.log('data: ')
    console.log(data)
    return reply.type('application/json').send(data);
  }

  @ApiResponse({
    status: 200,
    description: 'Player successfully energy update',
    type: PlayerEnergyResponse,
  })
  @UseGuards(PlayerGuard)
  @Post('energy')
  @Player()
  async updatePlayerEnergy(
    @Body() body: {energy: number},
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply
  ) {
    const { tgId } = req.currentUser
    const data = await this.gameplay.updateBonusEnergy(tgId, body.energy);
    return reply.type('application/json').send(data);
  }

  @Options('energy')
  @ApiResponse({
    status: 204,
    description: 'CORS preflight check for register endpoint',
  })
  async options(@Res() reply: FastifyReply) {
    return reply.status(204).send(); // Возвращаем успешный ответ для preflight
  }


  @ApiResponse({
    status: 200,
    description: 'Player successfully farmed money',
    type: PlayerFarmResponse,
  })

  @UseGuards(PlayerGuard)
  @Post('farm')
  @Player()
  async farm(
    @Body() body: FarmDto,
    @Req() req: FastifyRequest
  ) {
    const { tgId } = req.currentUser
    return await this.gameplay.updateBalance(tgId, body);
  }

  @ApiResponse({
    status: 200,
    description: 'Player successfully energy update',
    type: PlayerIncomeResponse,
  })
  @UseGuards(PlayerGuard)
  @Post('income')
  @Player()
  async updatePlayerIncome(
    @Body() body: {energy: number},
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply
  ) {
    const { tgId } = req.currentUser
    const data = await this.gameplay.updateBalanceWithIncome(tgId);
    return reply.type('application/json').send(data);
  }
}


