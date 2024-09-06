import { PickType } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { PlayerType } from '../types'

export class PlayerDto extends PickType(PlayerType, [
  'username',
  'tgId',
  'isPremium',
  'balance',
  'honeyLatest',
  'honeyMax',
  'firstName',
  'secondName'
] as const) {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  secondName: string;

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