import { PickType } from '@nestjs/swagger'
import { PlayerDto } from '@/helpers/dto'

export class PlayerLoginDto extends PickType(PlayerDto, [
  'userName',
  'tgId',
  'isPremium',
] as const) {}