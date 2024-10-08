import { Player } from '@prisma/client'

export class PlayersTokenDto {
  id: string;
  userName: string;
  tgId: string;

  constructor(entity: Player) {
    this.id = entity.id;
    this.userName = entity.username;
    this.tgId = entity.tgId;
  }
}