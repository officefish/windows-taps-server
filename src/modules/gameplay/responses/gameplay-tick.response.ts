import { ApiProperty } from '@nestjs/swagger'

export class GameplayTickResponse {
    @ApiProperty({
        description: 'Current energy value',
        example: 300,
        required: true,
      })
      energyLatest: number
    
      @ApiProperty({
        description: 'Max energy value',
        example: 1000,
        required: true,
      })
      energyMax: number

      
      @ApiProperty({
        description: 'Income added for tick',
        example: 1000,
        required: true,
      })
      incomeAdded

      @ApiProperty({
        description: 'New user money balance',
        example: 1000,
        required: true,
      })
      balance
}