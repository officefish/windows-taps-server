import { ApiProperty } from '@nestjs/swagger'
import { Player, RankType } from '@prisma/client'
import { UUID } from 'crypto';

export enum AccountType {
  PREMIUM,
  COMMON
}

export class ItemOnPlayerType {
  @ApiProperty({ description: 'Unique identifier for the player item', example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ description: 'Unique identifier for the player', example: '507f1f77bcf86cd799439011' })
  playerId: string;

  @ApiProperty({ description: 'Unique identifier for the item', example: '507f1f77bcf86cd799439011' })
  itemId: string;
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

  @ApiProperty({ description: 'Date and time of the player\'s last energy update', example: new Date() })
  lastEnergyUpdate: Date;

  @ApiProperty({ description: 'Date and time of the player\'s last login', example: '2023-09-01T12:34:56Z', nullable: true })
  lastLogin: Date;

  @ApiProperty({ description: 'Date and time of the player\'s last logout', example: '2023-09-01T14:34:56Z', nullable: true })
  lastLogout: Date;

  @ApiProperty({ description: 'Level ID of the player', example: 1, nullable: true })
  levelId: number;

  @ApiProperty({ description: 'Profit earned from referrals', example: 10.0, nullable: true })
  referralProfit: number;

  @ApiProperty({ description: 'ID of the player who invited this player', example: '507f1f77bcf86cd799439013', nullable: true })
  invitedById: string | null;

  @ApiProperty({ description: 'Player income per hour', example: '42.20' })
  incomePerHour: number;

  @ApiProperty({ description: 'Date and time of the last income update', example: new Date() })
  lastIncomeUpdate: Date;

  @ApiProperty({ description: 'Player active status', example: true })
  active: boolean;

  @ApiProperty({ description: 'ImageUrl', example: 'https://example.com/image.png' })
  imageUrl: string;

  @ApiProperty({ description: 'Rank type of the player', example: RankType.SHEETER, nullable: true })
  rank: RankType;

  @ApiProperty({ description: 'Player refferal code for personal invitations', example: '507f1f77bcf86cd799439011', nullable: true })
  referralCode: string;

}

export class PlayerType extends PlayerMinType implements Player {

  @ApiProperty({ description: 'Array of players invited by this player', type: [PlayerType], nullable: true })
  invitations: PlayerType[];

  

  @ApiProperty({ description: 'Array of players invited by this player', type: [ItemOnPlayerType], nullable: true })
  items: ItemOnPlayerType[];

  @ApiProperty({ description: 'Count of referrals made by the player', example: 10 })
  referralCount: number;

}

