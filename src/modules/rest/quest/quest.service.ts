import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from "@/modules/prisma/prisma.service"; // Подключаем сервис Prisma
import { Player } from '@prisma/client';
import { addHours, addMinutes, isBefore, subHours } from 'date-fns';


@Injectable()
export class QuestService {
  private readonly logger = new Logger(QuestService.name);
  
  constructor(
    private readonly prisma: PrismaService, // Ensure proper readonly
  ) {}

  async getDailyQuestByTgId(tgId: string) {

    const player = await this.prisma.player.findUnique({
      where: { tgId: tgId },
    });

    if (!player) {
      throw new Error('Игрок с таким tgId не найден');
    }

    // Попробуем найти ежедневный квест для игрока с данным tgId
    let dailyQuest = await this.prisma.dailyQuest.findFirst({
      where: {
        player: {
          tgId: tgId,
        },
      },
    });

    // Если ежедневный квест не найден, создаем новый
    if (!dailyQuest) {
      // Получаем данные о игроке по tgId
      
      // Create a new Date object for the current date
      const today = new Date();

      // Calculate the date 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);

      // Создаем новый квест
      dailyQuest = await this.prisma.dailyQuest.create({
        data: { // Привязываем к игроку
          player: {
            connect: {
              tgId: tgId,
            },
          },
          dailyQuestStreak: 0, // Устанавливаем начальные значения
          dailyBaseReward: 100,
          dailyMaxBonus: 200,
          dailyMaxStreak: 14,
          lastDailyClaim: thirtyDaysAgo, // Последний раз не брал награду
        },
      });
    }

    // Возвращаем ежедневный квест
    return dailyQuest;
  }

  async updateDailyQuest(dailyQuest: {
    id: string;
    dailyQuestStreak?: number;
    lastDailyClaim?: Date | null;
    dailyBaseReward?: number;
    dailyMaxBonus?: number;
    dailyMaxStreak?: number;
  }) {
    try {
      const updatedDailyQuest = await this.prisma.dailyQuest.update({
        where: { id: dailyQuest.id }, // Уникальный идентификатор записи для обновления
        data: {
          dailyQuestStreak: dailyQuest.dailyQuestStreak,
          lastDailyClaim: dailyQuest.lastDailyClaim,
          dailyBaseReward: dailyQuest.dailyBaseReward,
          dailyMaxBonus: dailyQuest.dailyMaxBonus,
          dailyMaxStreak: dailyQuest.dailyMaxStreak,
        },
      });
  
      // Возвращаем обновленную запись
      return updatedDailyQuest;
    } catch (error) {
      console.error('Ошибка при обновлении ежедневного квеста:', error);
      throw new Error('Не удалось обновить ежедневный квест');
    }
  }

  async claimDailyReward(tgId: string) {

    const dailyQuest = await this.getDailyQuestByTgId(tgId);
      
    const today = new Date();
    const oneDay = 24 * 60 * 60 * 1000; // Количество миллисекунд в дне

    if (dailyQuest.lastDailyClaim) {
      const lastClaimDate = new Date(dailyQuest.lastDailyClaim);
      const daysSinceLastClaim = Math.floor((today.getTime() - lastClaimDate.getTime()) / oneDay);

      // Проверка: если прошло больше 1 дня, стрик сбрасывается
      if (daysSinceLastClaim > 1) {
        dailyQuest.dailyQuestStreak = 0; // Сброс стрика
      }
    }

    // Увеличиваем стрик, но не больше значения dailyMaxStreak
    dailyQuest.dailyQuestStreak = Math.min(dailyQuest.dailyQuestStreak + 1, dailyQuest.dailyMaxStreak);

    // Рассчитываем бонус на основе стрика
    const bonusFactor = dailyQuest.dailyQuestStreak / dailyQuest.dailyMaxStreak;
    const bonus = Math.ceil(bonusFactor * dailyQuest.dailyMaxBonus);
    const totalReward = dailyQuest.dailyBaseReward + bonus;

    // Обновляем дату последнего забора награды
    dailyQuest.lastDailyClaim = today;

    // Сохраняем изменения в базе данных
    await this.updateDailyQuest(dailyQuest);

    // Увеличиваем баланс игрока
    let player = await this.prisma.player.findUnique({
      where: { tgId: tgId },
    });
    player = await this.prisma.player.update({
      where: { tgId: tgId },
      data: { balance: player.balance + totalReward },
    });

    return {
      //message: `Вы получили ${totalReward} единиц награды! Ваш стрик: ${dailyQuest.dailyQuestStreak} дней подряд.`,
      totalReward,
      dailyQuestStreak: dailyQuest.dailyQuestStreak,
      balance: player.balance,
    }
  }

  async getDailyRewardInfo(tgId: string) {
    // Получаем данные о игроке и его ежедневном квесте
    const dailyQuest = await this.getDailyQuestByTgId(tgId);
  
    const today = new Date();
    const oneDay = 24 * 60 * 60 * 1000; // Количество миллисекунд в дне
    let claimedToday = false;
  
    if (dailyQuest.lastDailyClaim) {
      const lastClaimDate = new Date(dailyQuest.lastDailyClaim);
      const daysSinceLastClaim = Math.floor((today.getTime() - lastClaimDate.getTime()) / oneDay);
  
      // Проверяем, забирал ли игрок награду сегодня
      if (daysSinceLastClaim === 0) {
        claimedToday = true;
      }
  
      // Если прошло больше одного дня, то стрик сбрасывается
      if (daysSinceLastClaim > 1) {
        dailyQuest.dailyQuestStreak = 0;
      }
    }
  
    // Рассчитываем следующую награду, которую получит игрок при продолжении забора наград
    const nextStreak = Math.min(dailyQuest.dailyQuestStreak + 1, dailyQuest.dailyMaxStreak);
    const bonusFactor = nextStreak / dailyQuest.dailyMaxStreak;
    const nextBonus = bonusFactor * dailyQuest.dailyMaxBonus;
    const nextReward = Math.ceil(dailyQuest.dailyBaseReward + nextBonus);
  
    // Формируем ответ
    return {
      claimedToday,                          // Забирал ли игрок награду сегодня
      streak: dailyQuest.dailyQuestStreak,    // Текущий стрик (количество дней подряд)
      nextReward                             // Награда за следующий день
    };
  }

  async playMiniGame(player: Player, 
    medium: {win: boolean, combination?: string, steps?: string}
  ) {
    let minigame = await this.prisma.minigame.findFirst({
      where: {
        playerId: player.id,
      }
    })

    const currentTime = new Date();

    if (!minigame) {
      minigame = await this.prisma.minigame.create({
        data: {
          lastPlayed: currentTime,
          player: {
            connect: {
              id: player.id, // Связь с пользователем через connect
            },
          },
        }
      })
    }

     // Проверка блокировки игры
     if (minigame.isBlocked && minigame.blockUntil && isBefore(currentTime, minigame.blockUntil)) {
      const remainingTime = (minigame.blockUntil.getTime() - currentTime.getTime()) / 1000 / 60;
      return {
        message: `Игра заблокирована. Осталось времени до разблокировки: ${Math.ceil(remainingTime)} минут.`,
        isBlocked: true,
        win: false,
        remainingTime: Math.ceil(remainingTime),
      }
    }


    if (medium.win) {
      await this.prisma.minigame.update({
        where: { id: minigame.id },
        data: {
          wins: minigame.wins + 1,
          lastPlayed: currentTime,
          isBlocked: true,
          blockUntil: addHours(currentTime, 24), // Блокируем на 24 часа
        },
      });
      await this.prisma.player.update({
        where: { id: player.id },
        data: {
          balance: player.balance + minigame.baunty,
        },
      })
      return {
        message: 'Вы победили! Игра заблокирована на 24 часа.',
        isBlocked: true,
        win: true,
        remainingTime: addHours(currentTime, 24).getTime() - currentTime.getTime(),
      } 
    } else {
      await this.prisma.minigame.update({
        where: { id: minigame.id },
        data: {
          lastPlayed: currentTime,
          isBlocked: true,
          blockUntil: addMinutes(currentTime, 30), // Блокируем на 30 минут
        },
      });
      return {
        message: 'Вы проиграли! Игра заблокирована на 30 минут.',
        isBlocked: true,
        win: true,
        remainingTime: addMinutes(currentTime, 30).getTime() - currentTime.getTime(),
      } 
    }
  }

  async isGameAvailable(player: Player) {
    const currentTime = new Date();
  
    // Ищем мини-игру игрока
    const minigame = await this.prisma.minigame.findFirst({
      where: {
        playerId: player.id,
      }
    });
  
    // Если мини-игры нет, она ещё не создана, значит игра доступна
    if (!minigame) {
      return {
        message: 'Игра доступна.',
        isBlocked: false,
        remainingTime: 0,
      };
    }
  
    // Проверка блокировки игры
    if (minigame.isBlocked && minigame.blockUntil && isBefore(currentTime, minigame.blockUntil)) {
      const remainingTime = (minigame.blockUntil.getTime() - currentTime.getTime()) / 1000 / 60;
      return {
        message: `Игра заблокирована. Осталось времени до разблокировки: ${Math.ceil(remainingTime)} минут.`,
        isBlocked: true,
        remainingTime: Math.ceil(remainingTime), // Оставшееся время в минутах
      };
    }
  
    // Если игра не заблокирована
    return {
      message: 'Игра доступна.',
      isBlocked: false,
      remainingTime: 0,
    };
  }
}


