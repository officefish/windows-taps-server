
import { ApiProperty } from '@nestjs/swagger'

export class PlayerEnergyResponse {
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
}