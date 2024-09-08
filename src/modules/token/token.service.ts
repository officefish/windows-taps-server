import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
    Logger,
  } from '@nestjs/common'
  //import * as jwt from 'jsonwebtoken'
  import { JwtService } from '@nestjs/jwt'
  import { PlayersTokenDto } from './dto'

  import { PrismaService } from '@/modules/prisma/prisma.service'
  //import { ConfigService } from '@nestjs/config'
  import { AppConfigService } from '@/modules/config/config.service' //AppConfigService
  
  @Injectable()
  export class TokenService {
    private readonly logger = new Logger(TokenService.name)
  
    constructor(
      private prisma: PrismaService,
      private config: AppConfigService,
      private jwt: JwtService
    ) {}
  
    generateTokens(payload: PlayersTokenDto) {
      const accessToken = this.jwt.sign(
        payload,
        {
          expiresIn: this.config.getJwtAccessExpiresIn(),
        },
      );
      const refreshToken = this.jwt.sign(
        payload,
        {
          expiresIn: this.config.getJwtRefreshExpiresIn(),
        },
      );
  
      this.logger.log(`Generated tokens for user with ID ${payload.id}`);
  
      return {
        accessToken,
        refreshToken,
      };
    }
  
    async saveTokens(playerId: string, refreshToken: string) {
      const user = await this.prisma.playerTokens.findFirst({
        where: { playerId: playerId },
      });
  
      if (user) {
        this.logger.log(`Updating refresh token for user with ID ${playerId}`);
        const updateExistingToken = await this.prisma.playerTokens.update({
          where: { playerId: playerId },
          data: { refreshToken },
        });
        return updateExistingToken;
      }
  
      this.logger.log(`Saving refresh token for user with ID ${playerId}`);
      const token = this.prisma.playerTokens.create({
        data: { refreshToken: refreshToken, playerId: playerId },
      });
      return token;
    }
  
    validateAccessToken(accessToken: string) {
      
      try {
        const payload = this.jwt.verify(
          accessToken,
        );
  
        this.logger.log(`Validated access token for user with tgId: ${payload.tgId}`);
        return payload as PlayersTokenDto;

      } catch (err: any) {
        this.logger.error(`Failed to validate access token: ${err.message}`);
        throw new UnauthorizedException();
      }
    }
  
    validateRefreshToken(refreshToken: string) {
      try {
        const token = this.jwt.verify(
          refreshToken,
          //this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        );
  
        this.logger.log(`Validated refresh token`);
  
        return token as PlayersTokenDto;
      } catch (err: any) {
        this.logger.error(`Failed to validate refresh token: ${err.message}`);
        throw new UnauthorizedException('Invalid token!');
      }
    }
  
    async deleteToken(refreshToken: string) {
      const token = await this.findToken(refreshToken);
  
      if (!token) {
        throw new NotFoundException('Refresh token not found!');
      }
  
      this.logger.log(`Deleting refresh token`);
      await this.prisma.playerTokens.delete({
        where: { id: token.id },
      });
      return { message: 'Token deleted successfully.' };
    }
  
    async findToken(refreshToken: string) {
      try {
        const token = await this.prisma.playerTokens.findFirst({
          where: { refreshToken: refreshToken },
        });
        return token;
      } catch (err: any) {
        this.logger.error(`Failed to find token: ${err.message}`);
        throw new UnauthorizedException(
          'Token not found! Please register first!',
        );
      }
    }
  
    generateResetToken(payload: PlayersTokenDto) {
      const resetToken = this.jwt.sign(
        payload,
        //this.configService.getOrThrow<string>('JWT_RESET_SECRET'),
        {
          expiresIn: this.config.getJwtResetTime(),
        },
      );
  
      this.logger.log(`Generated reset token for user with ID ${payload.id}`);
  
      return resetToken;
    }
  
    async validateResetToken(resetToken: string) {
      try {
        const token = this.jwt.verify(
          resetToken,
          //this.configService.getOrThrow<string>('JWT_RESET_SECRET'),
        );
  
        this.logger.log(`Validated reset token`);
  
        return token as PlayersTokenDto;
      } catch (err: any) {
        this.logger.error(`Failed to validate reset token: ${err.message}`);
        throw new UnauthorizedException('Invalid token!');
      }
    }
  }