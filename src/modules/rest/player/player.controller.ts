import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { GameplayService } from '@/modules/gameplay/gameplay.service'
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PlayerEnergyResponse, PlayerFarmResponse } from './responses';
import { Player, Public } from '@/common/decorators';
import { FarmDto } from './dto/farm.dto';
import { FastifyRequest } from 'fastify'; // Импорт FastifyRequest
import { PlayerGuard } from './guards/player.guard'


@ApiTags('player')
@Controller('player')
export class PlayerController {
  constructor(private readonly gameplay: GameplayService) {}

  @ApiResponse({
    status: 200,
    description: 'Player successfully energy update',
    type: PlayerEnergyResponse,
  })
  @UseGuards(PlayerGuard)
  @Get('energy')
  @Player()
  async getPlayerEnergy(@Req() req: FastifyRequest) {
    const { tgId } = req.currentUser
    return await this.gameplay.updateEnergy(tgId);
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
}


