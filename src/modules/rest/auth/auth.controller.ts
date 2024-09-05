import { 
  Body, 
  Controller, 
  ForbiddenException, 
  Get, 
  HttpCode, 
  Options, 
  Post, 
  Query 
} from '@nestjs/common'
import { ApiResponse, ApiTags } from '@nestjs/swagger'

import { Public } from '@/common/decorators/is-public.decorator'
import { Cookies } from '@/common/decorators/get-cookie.decorator'
import { SuccessMessageType } from '@/helpers/common/types'

import { AuthService } from './auth.service'

import { 
  PlayerLogoutOperation,
  PlayerRefreshOperation,
  PlayerLoginOperation } from './decorators'

import { PlayerRefreshResponse, PlayerLoginResponse } from './responses'

import { PlayerLoginDto } from './dto'
import { TelegramInitDataDto } from './dto/telegram-initial.dto'
import { TelegramService } from '@/modules/telegram/telegram.service'

@ApiTags('auth')
@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly telegramService: TelegramService
  ) {}

  @ApiResponse({
    status: 200,
    description: 'User successfully registered or logged in',
    type: PlayerLoginResponse,
  })
  @ApiResponse({
    status: 403,
    description: 'Invalid Telegram Init Data',
  })

  @Post('register')
  async register(
    @Body() initial: TelegramInitDataDto,
  ): Promise<PlayerLoginResponse> {

    console.log(`initData: ${initial.initData}`)

    const valid = this.telegramService.validateInitData(initial.initData);
    if (!valid) {
      // Возвращаем 403 ошибку если данные невалидные
      throw new ForbiddenException('Invalid Telegram Init Data');
    }

    const userData = this.telegramService.extractUserData(initial.initData);
    const dto = {
      tgId: userData.id,
      username: userData.username,
      isPremium: false,
    } as unknown as PlayerLoginDto

    return await this.authService.registerOrLogin(dto, null);
  }

  @Options('register')
  @ApiResponse({
    status: 204,
    description: 'CORS preflight check for register endpoint',
  })
  async options() {
    return; // Возвращаем успешный ответ для preflight
  }

  @PlayerLoginOperation()
  @HttpCode(200)
  @Post('login')
  async login(
    @Body() dto: PlayerLoginDto,
    @Query('referrerId') referrerId: string,
  ): Promise<PlayerLoginResponse> {
    return await this.authService.registerOrLogin(dto, referrerId);
  }

  @PlayerLogoutOperation()
  @HttpCode(200)
  @Post('logout')
  async logout(
    @Cookies('refreshToken') refreshToken: string,
  ): Promise<SuccessMessageType> {
    const { message } = await this.authService.logoutPlayer(refreshToken);

    return { message };
  }

  @PlayerRefreshOperation()
  @Get('refresh')
  async refresh(
    @Cookies('refreshToken') requestRefreshToken: string,
  ): Promise<PlayerRefreshResponse> {
    const { message, player, accessToken, refreshToken } =
      await this.authService.refreshTokens(requestRefreshToken);

    return {
      message,
      player,
      accessToken,
      refreshToken,
    };
  }
}