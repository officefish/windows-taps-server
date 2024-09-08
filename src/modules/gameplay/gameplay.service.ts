import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from "@/modules/prisma/prisma.service"; // Подключаем сервис Prisma
import { Cron, CronExpression } from '@nestjs/schedule'; // Для планирования задач

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

    // Обновляем текущую энергию, но она не может превышать максимальное значение
    const newEnergy = Math.min(player.energyLatest + recoveredEnergy, player.energyMax);

    // Сохраняем обновленное значение энергии и время последнего обновления
    await this.prisma.player.update({
      where: { tgId },
      data: {
        energyLatest: newEnergy,
        lastEnergyUpdate: now,
      },
    });

    this.logger.log(`Energy for user with tgId: ${player.tgId} updated`);

    return newEnergy;
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
    const newBalance = player.balance + money

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

  // Планирование периодического обновления энергии для всех пользователей
  @Cron(CronExpression.EVERY_MINUTE) // Обновляем энергию каждую минуту
  async updateEnergyForAllPlayers() {
    const players = await this.prisma.player.findMany()

    for (const player of players) {
      await this.updateEnergy(player.tgId)
    }
  }
}