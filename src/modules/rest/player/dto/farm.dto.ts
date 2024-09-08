import { ApiProperty } from '@nestjs/swagger'
import { IsNumber } from 'class-validator'

export class FarmDto { 

    @ApiProperty({ 
      description: 'User\'s farm value for current click', 
      example: 4 
    })
    @IsNumber()
    money: number;

    @ApiProperty({ 
        description: 'User\'s farm energy spend for click', 
        example: 1 
      })
      @IsNumber()
      energy: number;
}