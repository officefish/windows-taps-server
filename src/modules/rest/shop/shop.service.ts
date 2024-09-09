import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from "@/modules/prisma/prisma.service"; // Подключаем сервис Prisma

@Injectable()
export class ShopService {
  private readonly logger = new Logger(ShopService.name);
  
  constructor(
    private readonly prisma: PrismaService, // Ensure proper readonly
  ) {}

  async getItemsForPlayer(tgId: string) {
    const player = await this.prisma.player.findUnique({
        where: { tgId: tgId },
        include: { items: { include: { item: true } } },
      });
  
      if (!player) {
        throw new HttpException('Player not found', HttpStatus.NOT_FOUND);
      }
  
      this.logger.log(`Player ${tgId} requested items`);
  
      // Получаем все категории с товарами, доступными для ранга игрока
      const categories = await this.prisma.category.findMany({
        include: {
          items: {
            where: { rank: player.rank }, // Фильтруем товары по рангу игрока
            include: { dependencies: true }, // Включаем зависимости товаров
          },
        },
      });
  
      // Список ID предметов, которые игрок уже купил
      const playerItemIds = player.items.map(itemOnPlayer => itemOnPlayer.itemId);
  
      // Результирующий массив категорий с тремя списками товаров для каждой
      const result = categories.map(category => {
        // Разделяем товары на купленные, доступные и недоступные
        const purchasedItems = [];
        const availableItems = [];
        const unavailableItems = [];
  
        for (const item of category.items) {
          if (playerItemIds.includes(item.id)) {
            // Товар уже куплен
            purchasedItems.push(item);
          } else {
            // Проверяем, все ли зависимости куплены
            const dependenciesMet = item.dependencies.every(dep => playerItemIds.includes(dep.id));
  
            if (dependenciesMet) {
              // Все зависимости выполнены, товар доступен к покупке
              availableItems.push(item);
            } else {
              // Не все зависимости выполнены, товар недоступен
              unavailableItems.push(item);
            }
          }
        }
  
        return {
          categoryName: category.name,
          purchased: purchasedItems,
          available: availableItems,
          unavailable: unavailableItems,
        };
      });
  
      return result;
  }

}

