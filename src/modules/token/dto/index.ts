import { Players } from '@prisma/client'

export class PlayersTokenDto {
  id: string;
  userName: string;
  tgId: string;

  constructor(entity: Players) {
    this.id = entity.id;
    this.userName = entity.userName;
    this.tgId = entity.tgId;
  }
}