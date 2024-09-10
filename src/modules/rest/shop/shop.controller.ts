import { Controller, Get, Param, HttpException, HttpStatus, UseGuards, Post, Req, Logger, Body } from '@nestjs/common';
import { PlayerGuard } from '../player/guards/player.guard';
import { Player } from '@/common/decorators';
import { FastifyRequest, FastifyReply } from 'fastify'; // Импорт FastifyRequest
import { ShopService } from './shop.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { BuyItemResponse, GetItemsForPlayerResponse } from './responses/shop-items.response';

@ApiTags('shop')
@Controller('shop')
export class ShopController {
  
  constructor(private readonly service: ShopService) {}

  @ApiResponse({
    status: 200,
    description: 'Player items successfully responsed',
    type: GetItemsForPlayerResponse,
  })

  @UseGuards(PlayerGuard)
  @Post('items')
  @Player()
  async postItemsForPlayer(
    @Req() req: FastifyRequest,
  ) {
    // Получаем игрока и его предметы
    const { tgId } = req.currentUser

    // Если предметы еще не созданы, то создаем их
    await this.service.brootforceCreateItems()

    return await this.service.getItemsForPlayer(tgId)
  }

  @ApiResponse({
    status: 200,
    description: 'Player bought new item successfully',
    type: BuyItemResponse,
  })

  @UseGuards(PlayerGuard)
  @Post('buy')
  @Player()
  async buyItem(
    @Req() req: FastifyRequest,
    @Body() body: {cardId: string, item},
  ) {
    const { tgId } = req.currentUser
    return await this.service.buyItem(tgId, body.cardId)
  }

  @ApiResponse({
    status: 200,
    description: 'Player bought new item successfully',
    type: BuyItemResponse,
  })

  @UseGuards(PlayerGuard)
  @Post('upgrade')
  @Player()
  async upgradeItem(
    @Req() req: FastifyRequest,
    @Body() body: {cardId: string, item},
  ) {
    const { tgId } = req.currentUser
    return await this.service.upgradeItem(tgId, body.cardId)
  }

  @ApiResponse({
    status: 200,
    description: 'Player items successfully responsed',
    //type: DailyRewardResponse,
  })

  @UseGuards(PlayerGuard)
  @Get('items')
  @Player()
  async getItemsForPlayer(
    @Req() req: FastifyRequest,
  ) {
    // Получаем игрока и его предметы
    const { tgId } = req.currentUser

    // Если предметы еще не созданы, то создаем их
    await this.service.brootforceCreateItems()

    return await this.service.getItemsForPlayer(tgId)
  }
}