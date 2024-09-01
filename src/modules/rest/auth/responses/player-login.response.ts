import { Type } from 'class-transformer';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { SuccessResponse } from '@/helpers/common/types'
import { PlayerMinType } from '@/helpers/types';

export class PlayerLoginResponse extends PickType(SuccessResponse, [
  'message',
  'accessToken',
  'refreshToken',
] as const) {
  @ApiProperty({ type: PlayerMinType })
  @Type(() => PlayerMinType)
  player: PlayerMinType;

  @ApiProperty({ type: Boolean, description: 'If user new' })
  isNew?: boolean;
}

