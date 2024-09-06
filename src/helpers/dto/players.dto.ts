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
  'lastName',
  'incomePerHour',
  'active',
  'imageUrl',

] as const) {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

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

  @IsNotEmpty()
  @IsNumber()
  incomePerHour: number;

  @IsNotEmpty()
  @IsBoolean()
  active: boolean;

  @IsNotEmpty()
  @IsString()
  imageUrl: string;
}