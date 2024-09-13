import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/modules/prisma/prisma.service'
import { PlayersTokenDto } from '@/modules/token/dto'

import { ConfigService } from '@nestjs/config'
  
import { 
    GetReferralsQueryDto,
} from './dto'

@Injectable()
export class ReferralsService {
  private logger = new Logger(ReferralsService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async trackReferral(referrerId: string, referredId: string) {
    return this.prisma.referral.create({
      data: {
        referrerId,
        referredId,
      },
    });
  }

  async rewardReferrer(referrerId: string) {
    const referrer = await this.prisma.player.findUnique({ where: { id: referrerId } });
  
    // Логика начисления бонусов
    // await this.prisma.player.update({
    //   where: { id: referrerId },
    //   data: { /* обновляем данные пользователя */ },
    // });

    this.logger.log(`Игрок ${referrer.username} получил награду за приглашение.`);

  }

  async findByReferralCode(referralCode) {
    return this.prisma.player.findFirst({ where: { referralCode } });
  }

  // async calculateReferralProfit(
  //   dto: CreateReferralEarlyBonusDto,
  //   playerId: string,
  // ) {
  //   const player = await this.findPlayerById(playerId);
  //   if (dto.accountType) {
  //     const referralProfit =
  //       await this.prismaService.referralsEarlyBonuses.create({
  //         data: {
  //           playerId: player.id,
  //           accountType: dto.accountType,
  //           honey: dto.honey,
  //         },
  //       });

  //     await this.prismaService.players.update({
  //       where: { id: referralProfit.playerId },
  //       data: { referralProfit: { increment: referralProfit.honey } },
  //     });

  //     this.logger.log(`Добавлена прибыль от реферала для ID: ${player.id}`);
  //     return { message: 'Прибыль от реферала добавлена' };
  //   }
  //   const profit =
  //     dto.honey * this.configService.getOrThrow<number>('REFERRAL_BONUS');
  //   const referralProfit =
  //     await this.prismaService.referralsEarlyBonuses.create({
  //       data: { playerId: player.id, honey: profit },
  //     });

  //   await this.prismaService.referralsProfit.update({
  //     where: { playerId: referralProfit.playerId },
  //     data: { honey: { increment: referralProfit.honey } },
  //   });

  //   this.logger.log(`Добавлена прибыль от реферала для ID: ${player.id}`);
  //   return { message: 'Прибыль от реферала добавлена' };
  // }

  async getReferrals(currentUser: PlayersTokenDto, query?: GetReferralsQueryDto) {
    const { take = 10, page = 1 } = query || {};
    // Получаем общее количество рефералов
  const totalCount = await this.prisma.player.count({
    where: { invitedById: currentUser.id },
  });


  // Получаем срез рефералов
  const skip = (page - 1) * take
  const referrals = await this.prisma.player.findMany({
    where: { invitedById: currentUser.id },
    skip,
    take,
  });

    this.logger.log(
      `Получены рефералы для пользователя с ID: ${currentUser.id}`,
    )
    return { totalCount, referrals }
  }

  // // async collectReferralProfit(currentUser: PlayersTokenDto) {
  // //   const player = await this.findPlayerById(currentUser.id);

  // //   const referralProfit = await this.prismaService.referralsProfit.findFirst({
  // //     where: { playerId: player.id },
  // //   });

  // //   await this.prismaService.players.update({
  // //     where: { id: player.id },
  // //     data: { balance: { increment: referralProfit.honey } },
  // //   });

  // //   await this.prismaService.referralsProfit.update({
  // //     where: { playerId: player.id },
  // //     data: { honey: 0 },
  // //   });

  // //   this.logger.log(
  // //     `Собрана прибыль от рефералов для игрока с ID: ${player.id}`,
  // //   );
  // //   return {
  // //     message: 'Прибыль от рефералов собрана',
  // //   };
  // // }

  // private async findPlayerById(playerId: string) {
  //   const player = await this.prismaService.players.findUnique({
  //     where: { id: playerId },
  //   });
  //   if (!player) {
  //     this.logger.error(`Игрок не найден с ID: ${playerId}`);
  //     throw new NotFoundException('Игрок не найден!');
  //   }
  //   return player;
  // }

  // async createReferralQuest(dto: CreateReferralQuestDto) {
  //   const referralQuest = await this.prismaService.referralsQuest.create({
  //     data: { ...dto },
  //   });

  //   this.logger.log(`Создано задание реферала с ID: ${referralQuest.id}`);
  //   return referralQuest;
  // }

//   async updateReferralQuest(
//     referralQuestId: string,
//     dto: UpdateReferralQuestDto,
//   ) {
//     const referralQuest = await this.findReferralQuestById(referralQuestId);
//     const updatedReferralQuest = await this.prismaService.referralsQuest.update(
//       {
//         where: { id: referralQuest.id },
//         data: { ...dto },
//       },
//     );

//     this.logger.log(`Обновлено задание реферала с ID: ${referralQuest.id}`);
//     return {
//       message: 'Задание реферала успешно обновлено',
//       updatedReferralQuest,
//     };
//   }

//   async deleteReferralQuest(referralQuestId: string) {
//     const referralQuest = await this.findReferralQuestById(referralQuestId);
//     await this.prismaService.referralsQuest.delete({
//       where: { id: referralQuest.id },
//     });

//     this.logger.log(`Удалено задание реферала с ID: ${referralQuest.id}`);
//     return { message: 'Задание реферала успешно удалено' };
//   }

//   async getReferralQuests() {
//     const referralQuests = await this.prismaService.referralsQuest.findMany();

//     this.logger.log(`Получено ${referralQuests.length} заданий рефералов`);
//     return referralQuests;
//   }

//   private async findReferralQuestById(referralQuestId: string) {
//     const referralQuest = await this.prismaService.referralsQuest.findUnique({
//       where: { id: referralQuestId },
//     });
//     if (!referralQuest) {
//       this.logger.error(`Задание реферала не найдено с ID: ${referralQuestId}`);
//       throw new NotFoundException('Задание реферала не найдено');
//     }
//     return referralQuest;
//   }

//   async handleNewRegistration(playerId: string, referralCount: number) {
//     const referralQuests = await this.prismaService.referralsQuest.findMany();
//     for (const referralQuest of referralQuests) {
//       if (referralCount >= referralQuest.referralCount) {
//         await this.prismaService.referralsQuestProfit.create({
//           data: {
//             playerId,
//             referralsQuestId: referralQuest.id,
//             referralCount,
//             reward: referralQuest.reward,
//           },
//         });
//       }
//     }
//     this.logger.log(
//       `Обработана новая регистрация для игрока с ID: ${playerId}`,
//     );
//   }

//   async getReferralQuestsProfit(playerId: string) {
//     const referralProfits =
//       await this.prismaService.referralsQuestProfit.findMany({
//         where: { playerId },
//       });

//     let totalReward = 0;
//     for (const profit of referralProfits) {
//       totalReward += profit.reward;
//       await this.prismaService.referralsQuestProfit.delete({
//         where: { id: profit.id },
//       });
//     }

//     await this.prismaService.players.update({
//       where: { id: playerId },
//       data: { balance: { increment: totalReward } },
//     });

//     this.logger.log(
//       `Собраны прибыли от заданий рефералов для игрока с ID: ${playerId}`,
//     );
//     return { message: 'Начислены вознаграждения на баланс', totalReward };
//   }
// }
}