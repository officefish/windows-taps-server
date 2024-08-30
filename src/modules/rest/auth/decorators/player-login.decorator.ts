import { applyDecorators, UseInterceptors } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger'
import { SetCookieInterceptor , TransformDataInterceptor } from '@/common/interceptors'
import { PlayerLoginResponse } from '../responses'
import { PlayerLoginDto } from '../dto'

export function PlayerLoginOperation() {
  return applyDecorators(
    ApiOperation({ summary: 'User login' }),
    ApiBody({ type: PlayerLoginDto }),
    ApiResponse({
      status: 200,
      description: 'User login successful!',
      type: PlayerLoginResponse,
    }),
    ApiBadRequestResponse({ description: 'User not verified.' }),
    ApiBadRequestResponse({ description: 'Invalid password!' }),
    ApiNotFoundResponse({ description: 'User with phone number not found!' }),
    UseInterceptors(
      SetCookieInterceptor,
      new TransformDataInterceptor(PlayerLoginResponse),
    ),
  );
}