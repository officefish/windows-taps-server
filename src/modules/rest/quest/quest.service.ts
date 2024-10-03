import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from "@/modules/prisma/prisma.service"; // Подключаем сервис Prisma
import { Player } from '@prisma/client';
import { addHours, addMinutes, isBefore, subHours } from 'date-fns';

import { add, differenceInCalendarDays, startOfDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const MOSCOW_TIMEZONE = 'Europe/Moscow';

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
    dailyBonus?: number;
    dailyMaxStreak?: number;
  }) {
    try {
      const updatedDailyQuest = await this.prisma.dailyQuest.update({
        where: { id: dailyQuest.id }, // Уникальный идентификатор записи для обновления
        data: {
          dailyQuestStreak: dailyQuest.dailyQuestStreak,
          lastDailyClaim: dailyQuest.lastDailyClaim,
          dailyBaseReward: dailyQuest.dailyBaseReward,
          dailyBonus: dailyQuest.dailyBonus,
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
  
    const now = new Date();
    const moscowTimeNow = toZonedTime(now, MOSCOW_TIMEZONE);
    const todayStart = startOfDay(moscowTimeNow);
  
    if (dailyQuest.lastDailyClaim) {
      const lastClaimInMoscowTime = toZonedTime(dailyQuest.lastDailyClaim, MOSCOW_TIMEZONE);
      const daysSinceLastClaim = differenceInCalendarDays(todayStart, startOfDay(lastClaimInMoscowTime));
  
      // Если награда уже забрана сегодня
      if (daysSinceLastClaim === 0) {
        throw new Error('Daily reward already claimed today.');
      }
  
      // Если пропущен один день, сбрасываем стрик
      if (daysSinceLastClaim > 1) {
        dailyQuest.dailyQuestStreak = 0;
      }
    }
  
    // Увеличиваем стрик на 1
    dailyQuest.dailyQuestStreak = Math.min(dailyQuest.dailyQuestStreak + 1, dailyQuest.dailyMaxStreak);
  
    // Рассчитываем награду
    const totalReward = dailyQuest.dailyBaseReward + (dailyQuest.dailyBonus * dailyQuest.dailyQuestStreak);  
    
    // Обновляем запись в базе данных
    await this.prisma.dailyQuest.update({
      where: { id: dailyQuest.id },
      data: {
        dailyQuestStreak: dailyQuest.dailyQuestStreak,
        lastDailyClaim: now,
      },
    });

    let player = await this.prisma.player.findUnique({
      where: { tgId: tgId },
    });
    player = await this.prisma.player.update({
      where: { tgId: tgId },
      data: { balance: player.balance + totalReward },
    });
  
    return {
      //message: 'Daily reward claimed successfully!',
      dailyReward: {
        streak: dailyQuest.dailyQuestStreak,
        baseReward: dailyQuest.dailyBaseReward, // Базовая награда
        bonus: dailyQuest.dailyBonus,           // Бонус за каждый день
        maxStreak: dailyQuest.dailyMaxStreak,   
        claimedToday: true,
      },
      balance: player.balance,
       
    };
  }

  async getDailyRewardInfo(player: Player) {
    // Получаем данные о игроке и его ежедневном квесте
    const dailyQuest = await this.getDailyQuestByTgId(player.tgId);
    
    const now = new Date();
    const moscowTimeNow = toZonedTime(now, MOSCOW_TIMEZONE);
    const todayStart = startOfDay(moscowTimeNow);

    let claimedToday = false;
  
    if (dailyQuest.lastDailyClaim) {
      const lastClaimInMoscowTime = toZonedTime(dailyQuest.lastDailyClaim, MOSCOW_TIMEZONE);
      const daysSinceLastClaim = differenceInCalendarDays(todayStart, startOfDay(lastClaimInMoscowTime));
  
      // Если награда уже забрана сегодня
      if (daysSinceLastClaim === 0) {
        claimedToday = true;
      }
  
      // Если пропущен один день, сбрасываем стрик
      if (daysSinceLastClaim > 1) {
        dailyQuest.dailyQuestStreak = 0;
      }
    }
  
    // Увеличиваем стрик на 1
    dailyQuest.dailyQuestStreak = Math.min(dailyQuest.dailyQuestStreak + 1, dailyQuest.dailyMaxStreak);
    
    // Формируем ответ
    return {
      claimedToday,                          // Забирал ли игрок награду сегодня
      streak: dailyQuest.dailyQuestStreak,    // Текущий стрик (количество дней подряд)
      baseReward: dailyQuest.dailyBaseReward, // Базовая награда
      bonus: dailyQuest.dailyBonus,           // Бонус за каждый день
      maxStreak: dailyQuest.dailyMaxStreak,   // Максимальный стрик 
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
        //message: `Игра заблокирована. Осталось времени до разблокировки: ${Math.ceil(remainingTime)} минут.`,
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
        //message: 'Вы победили! Игра заблокирована на 24 часа.',
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
        //message: 'Вы проиграли! Игра заблокирована на 30 минут.',
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
        //message: 'Игра доступна.',
        isBlocked: false,
        remainingTime: 0,
        win: false,
      };
    }
  
    // Проверка блокировки игры
    if (minigame.isBlocked && minigame.blockUntil && isBefore(currentTime, minigame.blockUntil)) {
      return {
        //message: `Игра заблокирована. Осталось времени до разблокировки: ${Math.ceil(remainingTime)} минут.`,
        isBlocked: true,
        remainingTime: Math.max(minigame.blockUntil.getTime() - currentTime.getTime(), 0),
        win: false,
      };
    }
  
    // Если игра не заблокирована
    return {
      //message: 'Игра доступна.',
      isBlocked: false,
      remainingTime: 0,
      win: false,
    };
  }
}


