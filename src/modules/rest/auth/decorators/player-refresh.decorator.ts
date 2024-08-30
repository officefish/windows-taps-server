import { applyDecorators, UseInterceptors } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { TransformDataInterceptor, SetCookieInterceptor } from '@/common/interceptors/'
import { PlayerRefreshResponse } from '../responses/'

export function PlayerRefreshOperation() {
  return applyDecorators(
    ApiOperation({ summary: 'Refresh tokens' }),
    ApiBearerAuth(),
    ApiOkResponse({
      description: 'User tokens refreshed successfully.',
      type: PlayerRefreshResponse,
    }),
    ApiUnauthorizedResponse({ description: 'Refresh token not provided!' }),
    ApiUnauthorizedResponse({ description: 'Invalid token!' }),
    ApiNotFoundResponse({ description: 'User not found!' }),
    UseInterceptors(
      SetCookieInterceptor,
      new TransformDataInterceptor(PlayerRefreshResponse),
    ),
  );
}