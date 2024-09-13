import {
    Injectable,
    Logger,
    NotFoundException,
    UnauthorizedException,
  } from '@nestjs/common'
  import { ConfigService } from '@nestjs/config'

  import { PrismaService } from '@/modules/prisma/prisma.service'

  import { TokenService } from '@/modules/token/token.service'
  import { PlayersTokenDto } from '@/modules/token/dto'
  
  import { SuccessMessageType } from '@/helpers/common/types'
  import { PlayerRefreshResponse } from './responses'
  
  import { PlayerLoginDto } from './dto'
  import { PlayerLoginResponse } from './responses'

  import { ReferralsService } from '@/modules/rest/referrals/referrals.service'

  import { v4 as uuidv4 } from 'uuid'; // Для генерации уникального кода

  //import { CreateReferralEarlyBonusDto } from '@/modules/rest/referrals/dto/'
    
  @Injectable()
  export class AuthService {
    private logger = new Logger(AuthService.name);
    constructor(
      private tokenService: TokenService,
      private prismaService: PrismaService,
      private referralService: ReferralsService,
      private configService: ConfigService,
    ) {}
  
    async registerOrLogin(
      dto: PlayerLoginDto,
      referralCode: string,
    ): Promise<PlayerLoginResponse> {
      this.logger.log('Attempting to register or log in user...');
      const candidate = await this.prismaService.player.findFirst({
        where: { tgId: dto.tgId, username: dto.username },
      });
  
      if (candidate) {
        this.logger.log(
          `User ${candidate.username} found, enter in progress...`,
        );
        const tokens = this.tokenService.generateTokens({
          ...new PlayersTokenDto(candidate),
        });
        await this.tokenService.saveTokens(candidate.id, tokens.refreshToken);
        return {
          message: 'Player logged in',
          player: candidate,
          ...tokens,
        };
      }
  
      this.logger.log('User not found, registration in progress...');

      const generatedCode = uuidv4();  // Можно использовать другие методы генерации

      let invitedById = null;

      // Если есть реферальный код, находим кто пригласил
      if (referralCode) {
        const referrer = await this.prismaService.player.findUnique({
          where: { referralCode },
        });

        if (referrer) {
          invitedById = referrer.id;
        }
      }
      
      const player = await this.prismaService.player.create({
        data: {
          ...dto,
          invitedById,
          referralCode: generatedCode,
          lastLogin: new Date(),
          referralProfit: 0,
          createdAt: new Date(),
        },
      });
  
      const tokens = this.tokenService.generateTokens({
        ...new PlayersTokenDto(player),
      });
      await this.tokenService.saveTokens(player.id, tokens.refreshToken);
  
      this.logger.log('Пользователь успешно зарегистрирован');
      return {
        message: 'Player registered successfully!',
        player,
        ...tokens,
        isNew: true,
      };
    }
  
    async logoutPlayer(refreshToken: string): Promise<SuccessMessageType> {
      this.logger.log('Попытка выхода пользователя...');
      if (!refreshToken) {
        this.logger.error('Не предоставлен обновляющий токен!');
        throw new UnauthorizedException('Refresh token not provided');
      }
  
      await this.tokenService.deleteToken(refreshToken);
      this.logger.log('Пользователь успешно вышел');
  
      return { message: 'Player logged out' };
    }
  
    async refreshTokens(refreshToken: string): Promise<PlayerRefreshResponse> {
      this.logger.log('Попытка обновления токенов...');
      if (!refreshToken) {
        this.logger.error('Не предоставлен обновляющий токен!');
        throw new UnauthorizedException('Refresh token not provided!');
      }
  
      const tokenFromDB = await this.tokenService.findToken(refreshToken);
      const validToken = this.tokenService.validateRefreshToken(refreshToken);
  
      if (!validToken || !tokenFromDB) {
        this.logger.error('Неверный токен!');
        throw new UnauthorizedException('Invalid token!');
      }
  
      const player = await this.findPlayerById(validToken.id);
  
      if (!player) {
        this.logger.error('Пользователь не найден!');
        throw new NotFoundException('player not found!');
      }
  
      const tokens = this.tokenService.generateTokens({
        ...new PlayersTokenDto(player),
      });
  
      await this.tokenService.saveTokens(player.id, tokens.refreshToken);
  
      this.logger.log('Токены успешно обновлены');
      return {
        message: 'Токены успешно обновлены',
        ...tokens,
        player,
      };
    }
  
    private async findPlayerById(playerId: string) {
      this.logger.log(`Поиск пользователя с ID ${playerId}...`);
      const player = await this.prismaService.player.findUnique({
        where: { id: playerId },
      });
      if (!player) {
        this.logger.error('Пользователь не найден!');
        throw new NotFoundException('Player not found!');
      }
      return player;
    }
  }