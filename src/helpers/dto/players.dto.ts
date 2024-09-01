import { PickType } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { PlayerType } from '../types'

export class PlayerDto extends PickType(PlayerType, [
  'userName',
  'tgId',
  'isPremium',
  'balance',
  'honeyLatest',
  'honeyMax',
] as const) {
  @IsNotEmpty()
  @IsString()
  userName: string;

  @IsNotEmpty()
  @IsString()
  tgId: string;

  @IsBoolean()
  @IsNotEmpty()
  isPremium: boolean;

  @IsNumber()
  @IsNotEmpty()
  balance: number;

  @IsNumber()
  @IsNotEmpty()
  honeyLatest: number;

  @IsNotEmpty()
  @IsNumber()
  honeyMax: number;
}