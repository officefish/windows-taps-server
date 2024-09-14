import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsUUID } from 'class-validator'

export class TelegramInitDataDto { 

    @ApiProperty({ 
      description: 'User\'s Telegram Init data', 
      example: "'auth_date=<auth_date>\nquery_id=<query_id>\nuser=<user>'." 
    })
    @IsString()
    initData: string;
}


export class RegisterWithCommandDto extends TelegramInitDataDto { 

  @ApiProperty({ 
    description: 'User\'s Telegram refferal code (uuid)', 
    example: "referrerId=3b241101-e2bb-4255-8caf-4136c566a962" 
  })
  @IsString()
  command: string;
}