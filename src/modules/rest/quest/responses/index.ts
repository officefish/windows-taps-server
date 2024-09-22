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

export class MinigameInfoResponse {
  @ApiProperty({
      description: 'If player win game',
      example: 300,
      required: true,
    })
    win: boolean

    @ApiProperty({
      description: 'Time to next attempt',
      example: 300,
      required: true,
    })
    remainingTime: number

    @ApiProperty({
      description: 'If game is blocked',
      example: 300,
      required: true,
    })
    isBlocked: boolean
}

export class QuestInfoResponse {
  @ApiProperty({
    description: 'Information about daily rewards',
    type: DailyRewardInfoResponse,
    required: true,
  })
  dailyReward: DailyRewardInfoResponse;

  @ApiProperty({
    description: 'Information about minigame status',
    type: MinigameInfoResponse,
    required: true,
  })
  minigame: MinigameInfoResponse;
}