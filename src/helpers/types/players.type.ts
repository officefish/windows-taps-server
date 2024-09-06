import { ApiProperty } from '@nestjs/swagger'
import { Player } from '@prisma/client'

export enum AccountType {
  PREMIUM,
  COMMON
}

export class PlayerMinType {
  @ApiProperty({ description: 'Unique identifier for the player', example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ description: 'Date and time when the player was created', example: '2023-09-01T12:34:56Z', nullable: true })
  createdAt: Date;

  @ApiProperty({ description: 'Telegram ID of the player', example: '1234567890' })
  tgId: string;

  @ApiProperty({ description: 'Indicates if the player has a premium account', example: true })
  isPremium: boolean;

  @ApiProperty({ description: 'Username of the player', example: 'player123' })
  username: string;

  @ApiProperty({ description: 'First name of the player', example: 'Sergey' })
  firstName: string;

  @ApiProperty({ description: 'Lasr name of the player', example: 'Inozemcev' })
  lastName: string;

  @ApiProperty({ description: 'Player balance', example: 100.0 })
  balance: number;

  @ApiProperty({ description: 'Latest energy amount collected by the player', example: 50.0 })
  energyLatest: number;

  @ApiProperty({ description: 'Maximum energy amount collected by the player', example: 150.0 })
  energyMax: number;

  @ApiProperty({ description: 'Energy recovery rate by the player', example: 50.0 })
  recoveryRate : number;

  @ApiProperty({ description: 'Maximum energy amount collected by the player', example: 150.0 })
  lastEnergyUpdate: Date;

  @ApiProperty({ description: 'Date and time of the player\'s last login', example: '2023-09-01T12:34:56Z', nullable: true })
  lastLogin: Date;

  @ApiProperty({ description: 'Date and time of the player\'s last logout', example: '2023-09-01T14:34:56Z', nullable: true })
  lastLogout: Date;

  @ApiProperty({ description: 'Level ID of the player', example: 1, nullable: true })
  levelId: number;

  @ApiProperty({ description: 'Profit earned from referrals', example: 10.0, nullable: true })
  referralProfit: number;

  @ApiProperty({ description: 'Rank ID of the player', example: 1, nullable: true })
  rankId: number | null;

  @ApiProperty({ description: 'ID of the player who invited this player', example: '507f1f77bcf86cd799439013', nullable: true })
  invitedById: string | null;

  @ApiProperty({ description: 'Player income per hour', example: '42.20' })
  incomePerHour: number;

  @ApiProperty({ description: 'Player active status', example: true })
  active: boolean;

  @ApiProperty({ description: 'ImageUrl', example: 'https://example.com/image.png' })
  imageUrl: string;
}

export class PlayerType extends PlayerMinType implements Player {

  @ApiProperty({ description: 'Array of players invited by this player', type: [PlayerType], nullable: true })
  referrals: PlayerType[];

  @ApiProperty({ description: 'Count of referrals made by the player', example: 10 })
  referralCount: number;
  
  /* 
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
  */
}

