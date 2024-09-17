import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from "@/modules/prisma/prisma.service"; // Подключаем сервис Prisma
import { Cron, CronExpression } from '@nestjs/schedule'; // Для планирования задач
import { differenceInMilliseconds } from 'date-fns';
import { Player } from '@prisma/client'; // Импорт модели Player из Prisma Client


@Injectable()
export class GameplayService {
  private readonly logger = new Logger(GameplayService.name)  
  constructor(
    private prisma: PrismaService,
  ) {}

  // Метод для расчета текущей энергии
  async updateEnergy(player: Player) {
    
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
      where: { tgId: player.tgId },
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

  async updateBonusEnergy(player: Player, bonus: number) {
  
    const energyLatest = player.energyLatest + bonus

    await this.prisma.player.update({
      where: { tgId: player.tgId },
      data: {
        energyLatest,
      },
    });

    return this.updateEnergy(player)
  }

  async updateBalance(
    player: Player,
    inputData: {money: number, energy: number}
  ) {
    
    const { money, energy } = inputData

    const newEnergy = Math.max(player.energyLatest - energy, 0);

    let newBalance = player.balance
    if (money > 0 && newEnergy > 0) {
      newBalance += money 
    }

    const currentTime = new Date();

    const data = {
      energyLatest: newEnergy,
      balance: newBalance,
      energyMax: player.energyMax,
      lastEnergyUpdate: currentTime,
    }

    this.logger.log(`Balance for user with tgId: ${player.tgId} updated`);

    // Сохраняем обновленное значение энергии и время последнего обновления
    await this.prisma.player.update({
      where: { tgId: player.tgId },
      data,
    });

    return data;
  }

  async updateBalanceWithIncome(player: Player) {
    
    const { incomePerHour, lastIncomeUpdate, balance } = player;

    // Если доход меньше единицы за час, не обновляем баланс и выходим
    if (incomePerHour < 1) {
      return {
        newBalance: player.balance,
        incomeAdded: 0,
      };
    }
    
    // Считаем, сколько времени прошло с последнего обновления дохода (в миллисекундах)
    const currentTime = new Date();
    const millisecondsPassed = differenceInMilliseconds(currentTime, lastIncomeUpdate);

    // Преобразуем миллисекунды в часы (включая доли часа)
    const hoursPassed = millisecondsPassed / (1000 * 60 * 60);

    // Максимум доход начисляется за 3 часа
    const applicableHours = Math.min(hoursPassed, 3);

    // Рассчитываем доход за это время
    const incomeToAdd = Math.round(incomePerHour * applicableHours);

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
      where: { tgId: player.tgId },
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

  async tick(
    player: Player,
    inputData: { money: number, energy: number }
  ) {
    if (inputData.money === 0) {
      // Если money = 0, выполняем только updateBalanceWithIncome
      const [incomeUpdate, energyUpdate] = await Promise.all([
        this.updateBalanceWithIncome(player),
        this.updateEnergy(player),
      ]);
    
      const { incomeAdded } = incomeUpdate;
      const { energyLatest, energyMax } = energyUpdate;
  
      return {
        incomeAdded,
        balance: player.balance,  // В случае с 0, баланс остается прежним
        energyLatest: energyLatest,  // Значения энергии не изменяются
        energyMax: energyMax,
      };
    }
  
    // Если money != 0, выполняем все три запроса параллельно
    const [incomeUpdate, balanceUpdate] = await Promise.all([
      this.updateBalanceWithIncome(player),
      this.updateBalance(player, inputData),
    ]);
  
    const { incomeAdded } = incomeUpdate;
    const { balance } = balanceUpdate;

    const { energyLatest, energyMax } = await this.updateEnergy(player);
  
    return {
      incomeAdded,
      balance,
      energyLatest,
      energyMax
    };
  }

  // Планирование периодического обновления энергии для всех пользователей
  // @Cron(CronExpression.EVERY_MINUTE) // Обновляем энергию каждую минуту
  // async updateEnergyForAllPlayers() {
  //   const players = await this.prisma.player.findMany()

  //   for (const player of players) {
  //     await this.updateEnergy(player)
  //   }
  // }
}