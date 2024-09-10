import { ApiProperty } from '@nestjs/swagger'

export class PlayerIncomeResponse {
    @ApiProperty({
        description: 'Current balance value',
        example: 300,
        required: true,
      })
      balance: number
    
      @ApiProperty({
        description: 'Income bonus value',
        example: 1000,
        required: true,
      })
      incomeAdded: number
}