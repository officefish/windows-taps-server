import { ApiProperty } from '@nestjs/swagger'
import { Player } from '@prisma/client'

export class PlayerType implements Player {
  @ApiProperty({
    description: 'Unique identifier for the player',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Latest amount of honey the player has',
    example: 500.0,
  })
  honeyLatest: number;

  @ApiProperty({
    description: 'Maximum amount of honey the player can have',
    example: 1000.0,
  })
  honeyMax: number;

  @ApiProperty({
    description: 'Balance of the player',
    example: 1000.5,
  })
  balance: number;

  @ApiProperty({
    description: 'Date and time when the player last logged in',
    example: '2023-01-01T12:00:00Z',
  })
  lastLogin: Date;

  @ApiProperty({
    description: 'Date and time when the player last logged out',
    example: '2023-01-01T14:00:00Z',
  })
  lastLogout: Date;

  @ApiProperty({
    description: "ID of the player's current level",
    example: 'level123',
  })
  levelId: string;

  @ApiProperty({
    description: 'ID of the referral who referred the player',
    example: 'referrer123',
  })
  referredById: string;

  @ApiProperty({
    description: 'Rank ID associated with the player',
    example: 'rank123',
  })
  rankId: string;

  @ApiProperty({
    description: 'Telegram ID of the player',
    example: 123456789,
  })
  tgId: string;

  @ApiProperty({
    description: 'Indicates if the player has premium status',
    example: true,
  })
  isPremium: boolean;

  @ApiProperty({
    description: 'Username of the player',
    example: 'johndoe',
  })
  userName: string;

  @ApiProperty({
    description: 'Date and time when the player was created',
    example: '2023-01-01T00:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({ description: 'Boss streak of the player', example: 5 })
  bossStreak: number;

  @ApiProperty({
    description: 'Boss last date of the player',
    example: '2023-01-01T00:00:00Z',
  })
  lastBossDate: Date;

  @ApiProperty({ description: 'Referral profit of the player', example: 500.0 })
  referralProfit: number;

  @ApiProperty({ description: 'Farming date of the player', example: 500.0 })
  farmingDate: Date;
}