import { applyDecorators, UseInterceptors } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ClearCookieInterceptor } from '@/common/interceptors'
import { SuccessMessageType } from '@/helpers/common/types'

export function PlayerLogoutOperation() {
  return applyDecorators(
    ApiOperation({ summary: 'User logout' }),
    ApiBearerAuth(),
    ApiResponse({
      status: 200,
      description: 'Log out successfully.',
      type: SuccessMessageType,
    }),
    UseInterceptors(ClearCookieInterceptor),
    ApiUnauthorizedResponse({ description: 'Refresh token not provided.' }),
  );
}