import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from "@/modules/prisma/prisma.service"; // Подключаем сервис Prisma
import { Cron, CronExpression } from '@nestjs/schedule'; // Для планирования задач
import { differenceInHours } from 'date-fns';

@Injectable()
export class GameplayService {
  private readonly logger = new Logger(GameplayService.name)  
  constructor(
    private prisma: PrismaService,
  ) {}

  // Метод для расчета текущей энергии
  async updateEnergy(tgId: string) {
    const player = await this.prisma.player.findUnique({ where: { tgId } })

    if (!player) {
      throw new Error('User not found')
    }

    // Текущее время
    const now = new Date();

    // Разница в секундах с момента последнего обновления
    const elapsedTime = (now.getTime() - player.lastEnergyUpdate.getTime()) / 1000;

    // Восстановленная энергия
    const recoveredEnergy = player.recoveryRate * elapsedTime;

    let newEnergy = Math.round(player.energyLatest + recoveredEnergy); 

    // Обновляем текущую энергию, но она не может превышать максимальное значение
    newEnergy = Math.min(newEnergy, player.energyMax);

    // Сохраняем обновленное значение энергии и время последнего обновления
    await this.prisma.player.update({
      where: { tgId },
      data: {
        energyLatest: newEnergy,
        lastEnergyUpdate: now,
      },
    });

    this.logger.log(`Energy for user with tgId: ${player.tgId} updated`);

    const data = {
      energyLatest: newEnergy,
      energyMax: player.energyMax
    }
    return data;
  }

  async updateBonusEnergy(tgId: string, bonus: number) {
    const player = await this.prisma.player.findUnique({ where: { tgId } })
    if (!player) {
      throw new Error('User not found')
    }

    const energyLatest = player.energyLatest + bonus

    await this.prisma.player.update({
      where: { tgId },
      data: {
        energyLatest,
      },
    });

    return this.updateEnergy(tgId)
  }

  async updateBalance(
    tgId: string,
    inputData: {money: number, energy: number}
  ) {
    const player = await this.prisma.player.findUnique({ where: { tgId } })

    if (!player) {
      throw new Error('User not found')
    }

    const { money, energy } = inputData

    const newEnergy = Math.max(player.energyLatest - energy, 0);

    let newBalance = player.balance
    if (money > 0 && newEnergy > 0) {
      newBalance += money 
    }

    const data = {
      energyLatest: newEnergy,
      balance: newBalance,
      energyMax: player.energyMax
    }

    this.logger.log(`Balance for user with tgId: ${player.tgId} updated`);

    // Сохраняем обновленное значение энергии и время последнего обновления
    await this.prisma.player.update({
      where: { tgId },
      data,
    });

    return data;
  }

  async updateBalanceWithIncome(tgId: string) {
    // Найти игрока
    const player = await this.prisma.player.findUnique({
      where: { tgId },
    });

    if (!player) {
      throw new HttpException('Player not found', HttpStatus.NOT_FOUND);
    }

    const { incomePerHour, lastIncomeUpdate, balance } = player;

    // Если доход меньше единицы за час, не обновляем баланс и выходим
    if (incomePerHour < 1) {
      throw new HttpException(
        'Income per hour is too low to update balance',
        HttpStatus.BAD_REQUEST
      );
    }

    // Считаем, сколько времени прошло с последнего обновления дохода
    const currentTime = new Date();
    const hoursPassed = differenceInHours(currentTime, lastIncomeUpdate);

    // Если прошло менее одного часа, не обновляем баланс
    if (hoursPassed < 1) {
      throw new HttpException(
        'Not enough time has passed since the last income update',
        HttpStatus.BAD_REQUEST
      );
    }

    // Максимум доход начисляется за 3 часа
    const applicableHours = Math.min(hoursPassed, 3);

    // Рассчитываем доход за это время
    const incomeToAdd = incomePerHour * applicableHours;

    // Если итоговый доход меньше 1, не обновляем баланс и время
    if (incomeToAdd < 1) {
      return {
        newBalance: player.balance,
        incomeAdded: 0,
      };
    }

    // Обновляем баланс игрока
    const updatedBalance = balance + incomeToAdd;

    // Обновляем время последнего расчета дохода и баланс в базе данных
    await this.prisma.player.update({
      where: { tgId },
      data: {
        balance: updatedBalance,
        lastIncomeUpdate: currentTime,
      },
    });

    return {
      newBalance: updatedBalance,
      incomeAdded: incomeToAdd,
    };
  }

  // Планирование периодического обновления энергии для всех пользователей
  @Cron(CronExpression.EVERY_MINUTE) // Обновляем энергию каждую минуту
  async updateEnergyForAllPlayers() {
    const players = await this.prisma.player.findMany()

    for (const player of players) {
      await this.updateEnergy(player.tgId)
    }
  }
}