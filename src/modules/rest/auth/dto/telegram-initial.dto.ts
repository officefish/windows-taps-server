import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class TelegramInitDataDto { 

    @ApiProperty({ 
      description: 'User\'s Telegram Init data', 
      example: "'auth_date=<auth_date>\nquery_id=<query_id>\nuser=<user>'." 
    })
    @IsString()
    initData: string;
}