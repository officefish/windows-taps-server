import { ApiProperty } from '@nestjs/swagger'
import { IsNumber } from 'class-validator'

export class GameplayTickDto { 

    @ApiProperty({ 
      description: 'User\'s farm value for current tick', 
      example: 4 
    })
    @IsNumber()
    money: number;

    @ApiProperty({ 
        description: 'User\'s farm energy spend for tick', 
        example: 1 
      })
      @IsNumber()
      energy: number;
}