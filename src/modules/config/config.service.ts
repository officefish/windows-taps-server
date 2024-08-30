import { Injectable } from '@nestjs/common'
import { ConfigService as NestConfigService } from '@nestjs/config'

@Injectable()
export class AppConfigService {
  constructor(private configService: NestConfigService) {}

  getJwtSignature(): string {
    return this.configService.get('JWT_SIGNATURE')
  }

  getSessionSecret(): string {
    return this.configService.get('SESSION_SECRET')
  }

  getSessionMaxAge(): number {
    return this.configService.get('SESSION_MAX_AGE')
  }

  getAccessTokenMinutes(): number {
    return this.configService.get('ACCESS_TOKEN_MINUTES')
  }

  getRefreshTokenDays(): number {
    return this.configService.get('REFRESH_TOKEN_DAYS')
  }

  getSaltLength(): number {
    return this.configService.get('JWT_SALT_LENGTH')
  }

  getAvatarUrl(): string {
    return this.configService.get('AVATAR_URL')
  }

  getCoverUrl(): string {
    return this.configService.get('COVER_URL')
  }

  getAlphaVintageApiKey(): string {
    return this.configService.get('ALPHA_VINTAGE_API_KEY')
  }

  getDefaultArtPath(): string {
    return this.configService.get('DEFAULT_ART')
  }

  getJwtAccessTime(): string {
    return this.configService.get('JWT_ACCESS_TIME')
  }

  getJwtRefreshTime(): string {
    return this.configService.get('JWT_REFRESH_TIME')
  }

  getJwtResetTime(): string {
    return this.configService.get('JWT_RESET_TIME')
  }
}