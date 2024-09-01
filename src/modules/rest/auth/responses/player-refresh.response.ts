import { Type } from 'class-transformer'
import { SuccessResponse } from '@/helpers/common/types'
import { ApiProperty, PickType } from '@nestjs/swagger'
import { PlayerMinType } from '@/helpers/types'

export class PlayerRefreshResponse extends PickType(SuccessResponse, [
  'message',
  'accessToken',
  'refreshToken',
] as const) {
  @ApiProperty({ type: PlayerMinType })
  @Type(() => PlayerMinType)
  player: PlayerMinType
}