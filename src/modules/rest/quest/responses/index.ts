import { ApiProperty } from '@nestjs/swagger'

export class DailyRewardResponse {
    @ApiProperty({
        description: 'Current user balance',
        example: 300,
        required: true,
      })
      balance: number

      @ApiProperty({
        description: 'Daily reward value',
        example: 300,
        required: true,
      })
      totalReward: number

      @ApiProperty({
        description: 'Daily quest steak',
        example: 300,
        required: true,
      })
      dailyQuestStreak: number
}


export class DailyRewardInfoResponse {
    @ApiProperty({
        description: 'If daily quest claimed today',
        example: true,
        required: true,
      })
      claimedToday: boolean

      @ApiProperty({
        description: 'Next daily reward value',
        example: 300,
        required: true,
      })
      nextReward: number

      @ApiProperty({
        description: 'Daily quest streak',
        example: 300,
        required: true,
      })
      streak: number
}