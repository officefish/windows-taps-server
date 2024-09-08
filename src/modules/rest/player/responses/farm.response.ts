import { ApiProperty } from '@nestjs/swagger'
import { PlayerEnergyResponse } from './energy.response'

export class PlayerFarmResponse extends PlayerEnergyResponse {
    @ApiProperty({
        description: 'Current balance value',
        example: 300,
        required: true,
      })
    balance: number
    
     
}