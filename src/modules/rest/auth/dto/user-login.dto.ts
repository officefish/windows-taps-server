import { PickType } from '@nestjs/swagger'
import { PlayerDto } from '@/helpers/dto'

export class PlayerLoginDto extends PickType(PlayerDto, [
  'username',
  'firstName',
  'secondName',
  'tgId',
  'isPremium',
] as const) {}