import { ApiProperty } from '@nestjs/swagger'

import { IsString, IsOptional } from 'class-validator';

export class TelegramUserType {
  @ApiProperty({ description: 'User\'s Telegram ID', example: '123456789' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'User\'s first name', example: 'John' })
  @IsString()
  first_name: string;

  @ApiProperty({ description: 'User\'s last name', example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiProperty({ description: 'User\'s username', example: 'johndoe', required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ description: 'User\'s photo URL', example: 'https://t.me/i/userpic', required: false })
  @IsOptional()
  @IsString()
  photo_url?: string;

//   @ApiProperty({ description: 'Hashed data from Telegram for validation', example: 'abcd1234' })
//   @IsString()
//   hash: string;
}