import { Controller, Get, Param } from '@nestjs/common';
import { GameplayService } from '@/modules/gameplay/gameplay.service'
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PlayerEnergyResponse } from './responses';
import { Public } from '@/common/decorators';

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
  
  @Get(':tgId/energy')
  async getPlayerEnergy(@Param('tgId') tgId: string) {
    const energy = await this.gameplay.updateEnergy(tgId);
    return { energy };
  }
}