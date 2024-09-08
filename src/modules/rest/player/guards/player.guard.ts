import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '@/modules/prisma/prisma.service'
import { IS_PUBLIC_KEY } from '@/common/decorators'
import { IS_PLAYER_KEY } from '@/common/decorators'
import { TokenService } from '@/modules/token/token.service'


@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private tokenService: TokenService,
    private reflector: Reflector,
    private prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const isPlayer = this.reflector.getAllAndOverride(IS_PLAYER_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    try {
      if (isPublic) return true;
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        this.logger.error('User unauthorized');
        throw new UnauthorizedException('User unauthorized');
      }

      const bearer = authHeader.split(' ')[0];
      const token = authHeader.split(' ')[1];

      if (bearer !== 'Bearer' || !token) {
        this.logger.error('User unauthorized');
        throw new UnauthorizedException('User unauthorized');
      }

      if (isPlayer) {
        const userToken = this.tokenService.validateAccessToken(token);

        const user = await this.prismaService.player.findUnique({
          where: { id: userToken.id },
        });
        
        if (!user)
          throw new NotFoundException('User not found. Maybe deleted ?');

        req.currentUser = userToken;
        return true;
      }

      return true;
    } catch (e) {
      this.logger.error('User unauthorized');
      throw new UnauthorizedException('User unauthorized');
    }
  }
}