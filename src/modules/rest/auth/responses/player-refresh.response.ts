import { Type } from 'class-transformer'
import { SuccessResponse } from '@/helpers/common/types'
import { ApiProperty, PickType } from '@nestjs/swagger'
import { PlayerType } from '@/helpers/types'

export class PlayerRefreshResponse extends PickType(SuccessResponse, [
  'message',
  'accessToken',
  'refreshToken',
] as const) {
  @ApiProperty({ type: PlayerType })
  @Type(() => PlayerType)
  player: PlayerType
}