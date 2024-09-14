import { Body, Controller, Get, NotFoundException, Options, Post, Req, Res, UseGuards } from '@nestjs/common';
import { GameplayService } from '@/modules/gameplay/gameplay.service'
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PlayerEnergyResponse, PlayerFarmResponse } from './responses';
import { CurrentUser, Player } from '@/common/decorators';
import { FarmDto } from './dto/farm.dto';
import { FastifyRequest, FastifyReply } from 'fastify'; // Импорт FastifyRequest
import { PlayerGuard } from './guards/player.guard'
import { PlayerIncomeResponse } from './responses/income.response';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { GameplayTickDto } from '@/modules/gameplay/dto/gameplay-tick.dto';
import { GameplayTickResponse } from '@/modules/gameplay/responses/gameplay-tick.response';
import { PlayersTokenDto } from '@/modules/token/dto';
import { GetReferralsQueryDto } from '../referrals/dto';
import { ReferralsService } from '../referrals/referrals.service';


@ApiTags('player')
@Controller('player')
export class PlayerController {
  constructor(
    private readonly gameplay: GameplayService,
    private readonly prisma: PrismaService, 
    private readonly referralsService: ReferralsService
  ) {}

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

    /* Player */
    const player = await this.prisma.player.findUnique({ where: { tgId } })
    if (!player) {
      throw new NotFoundException('User not found');
    }

    const data = await this.gameplay.updateEnergy(player);
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
    
    /* Player */
    const player = await this.prisma.player.findUnique({ where: { tgId } })
    if (!player) {
      throw new NotFoundException('User not found');
    }
 
    const data = await this.gameplay.updateBonusEnergy(player, body.energy);
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
    /* Player */
    const player = await this.prisma.player.findUnique({ where: { tgId } })
    if (!player) {
      throw new NotFoundException('User not found');
    }

    return await this.gameplay.updateBalance(player, body);
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

    /* Player */
    const player = await this.prisma.player.findUnique({ where: { tgId } })
    if (!player) {
      throw new NotFoundException('User not found');
    }

    const data = await this.gameplay.updateBalanceWithIncome(player);
    return reply.type('application/json').send(data);
  }

  
  @ApiResponse({
    status: 200,
    description: 'Gameplay regular tick updated',
    type: GameplayTickResponse,
  })
  @UseGuards(PlayerGuard)
  @Post('tick')
  @Player()
  async tick(
    @Body() body: GameplayTickDto,
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply
  ) {
    const { tgId } = req.currentUser

    /* Player */
    const player = await this.prisma.player.findUnique({ where: { tgId } })
    if (!player) {
      throw new NotFoundException('User not found');
    }
    const data = await this.gameplay.tick(player, body);
    return reply.type('application/json').send(data);
  }

  @ApiResponse({
    status: 200,
    description: 'Gameplay regular tick updated',
    //type: GameplayTickResponse,
  })
  @UseGuards(PlayerGuard)
  @Post('/refferals')
  async getRefferals(
    @CurrentUser() currentUser: PlayersTokenDto,
    @Body() body: GetReferralsQueryDto,
    @Res() reply: FastifyReply
  ) {
    const { tgId } = currentUser

    /* Player */     
    const player = await this.referralsService.getReferrerByTgId(tgId, body);
    if (!player) {
      throw new NotFoundException('User not found');
    }
    const count = await this.referralsService.getReferralsCount(player);
    return reply.type('application/json').send(
      {
        refferals: player.invitations,
        refferalCode: player.referralCode, 
        count
      });
  }

}


