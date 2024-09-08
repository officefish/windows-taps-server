import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { GameplayService } from '@/modules/gameplay/gameplay.service'
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PlayerEnergyResponse, PlayerFarmResponse } from './responses';
import { Public } from '@/common/decorators';
import { FarmDto } from './dto/farm.dto';
import { FastifyRequest } from 'fastify'; // Импорт FastifyRequest
import { AuthGuard } from './guards/player.guard';


@ApiTags('player')
@Public()
@Controller('player')
export class PlayerController {
  constructor(private readonly gameplay: GameplayService) {}

  @ApiResponse({
    status: 200,
    description: 'Player successfully energy update',
    type: PlayerEnergyResponse,
  })
  @UseGuards(AuthGuard)
  @Get('energy')
  async getPlayerEnergy(@Req() req: FastifyRequest) {
    const { tgId } = req.currentUser
    const energy = await this.gameplay.updateEnergy(tgId);
    return { energy };
  }

  @ApiResponse({
    status: 200,
    description: 'Player successfully farmed money',
    type: PlayerFarmResponse,
  })

  @UseGuards(AuthGuard)
  @Post('farm')
  async farm(
    @Body() body: FarmDto,
    @Req() req: FastifyRequest
  ) {
    const { tgId } = req.currentUser
    return await this.gameplay.updateBalance(tgId, body);
  }
}