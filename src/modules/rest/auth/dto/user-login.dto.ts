import { PickType } from '@nestjs/swagger'
import { PlayerDto } from '@/helpers/dto'

export class PlayerLoginDto extends PickType(PlayerDto, [
  'username',
  'firstName',
  'lastName',
  'tgId',
  'isPremium',
] as const) {}