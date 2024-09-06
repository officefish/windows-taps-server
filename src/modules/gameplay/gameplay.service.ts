import { Injectable } from '@nestjs/common';
import { PrismaService } from "@/modules/prisma/prisma.service"; // Подключаем сервис Prisma
import { Cron, CronExpression } from '@nestjs/schedule'; // Для планирования задач

@Injectable()
export class GameplayService {
  constructor(private prisma: PrismaService) {}

  // Метод для расчета текущей энергии
  async updateEnergy(playerId: string) {
    const player = await this.prisma.player.findUnique({ where: { tgId: playerId } })

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
      where: { tgId: playerId },
      data: {
        energyLatest: newEnergy,
        lastEnergyUpdate: now,
      },
    });

    return newEnergy;
  }

  // Планирование периодического обновления энергии для всех пользователей
  @Cron(CronExpression.EVERY_MINUTE) // Обновляем энергию каждую минуту
  async updateEnergyForAllPlayers() {
    const players = await this.prisma.player.findMany()

    for (const player of players) {
      await this.updateEnergy(player.id)
    }
  }
}