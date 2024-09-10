import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from "@/modules/prisma/prisma.service"; // Подключаем сервис Prisma
import { RankType } from '@prisma/client';

@Injectable()
export class ShopService {
  private readonly logger = new Logger(ShopService.name);
  
  constructor(
    private readonly prisma: PrismaService, // Ensure proper readonly
  ) {}

  async getCategoriesCount() {
    return await this.prisma.category.count();
  }

  async brootforceCreateItems() {
    // Проверяем, существуют ли категории
    const existingCategories = await this.prisma.category.findMany();
    if (existingCategories.length > 0) {
      console.log('Categories already exists');
      return;
    }

     // Создание категорий и товаров
      const categories = {
        MIND: [
          { name: 'School', income: 50, cost: 300, imageUrl:'shop/school.jpg', dependencies: [] },
          { name: 'Institute', income: 300, cost: 3500, imageUrl:'shop/university.jpg', dependencies: [{name:'School', level: 1}] },
          { name: 'Friends', income: 120, cost: 800, imageUrl:'shop/friends.jpg', dependencies: [] },
        ],
        PHYSICAL_EDUCATION: [
          { name: 'Exercises', income: 150, cost: 750, imageUrl:'shop/fitness.jpg', dependencies: [] },
          { name: 'Gym', income: 200, cost: 1000, imageUrl:'shop/fitness-room.jpg', dependencies: [{name:'Exercises', level: 1}] },
        ],
        CLOTHES: [
          { name: 'Cap', income: 50, cost: 300, imageUrl:"shop/cap.jpg", dependencies: [] },
          { name: 'Raincoat', income: 50, cost: 300, imageUrl:"shop/windbreaker.jpg", dependencies: [] },
          { name: 'Boots', income: 50, cost: 300, imageUrl:"shop/shoes.jpg", dependencies: [] },
          { name: 'Jacket', income: 100, cost: 500, imageUrl:"shop/shoes.jpg", dependencies: [] },
        ],
      };

      await this.createCategoryAndItems('MIND', categories.MIND);
      await this.createCategoryAndItems('PHYSICAL EDUCATION', categories.PHYSICAL_EDUCATION);
      await this.createCategoryAndItems('CLOTHES', categories.CLOTHES);
    
      this.logger.log('Categories and items success added');
  }

  // Функция для создания товаров с зависимостями
  async createCategoryAndItems(categoryName: string, items: any[]) {
    const category = await this.prisma.category.create({
      data: {
        name: categoryName,
      },
    });

    // Создаем товары для этой категории
    const createdItems = {};
    for (const item of items) {
      const createdItem = await this.prisma.item.create({
        data: {
          name: item.name,
          description: item.description,
          income: item.income,
          price: item.cost,
          imageUrl: item.imageUrl,
          rank: RankType.SHEETER,
          category: { connect: { id: category.id } },
        },
      });

      // Сохраняем созданные товары для их использования в зависимостях
      createdItems[item.name] = createdItem;
    }

    // Устанавливаем зависимости для товаров
    for (const item of items) {
      if (item.dependencies.length > 0) {
        for (const dependency of item.dependencies) {
          const dependencyName = dependency.name;
          const dependencyLevel = dependency.level;
          const dependencyItem = createdItems[dependencyName];
          const currentItem = createdItems[item.name];

          // Создаем запись зависимости
          await this.prisma.itemDependency.create({
            data: {
              itemId: currentItem.id,
              dependsOnId: dependencyItem.id,
              level: dependencyLevel,
            },
          });
        }
      }
    }
  }

  // Создаем категории и товары

  async getItemsForPlayer(tgId: string) {
   // Находим игрока по tgId и получаем список его предметов
   const player = await this.prisma.player.findUnique({
    where: { tgId: tgId },
    include: { items: { include: { item: true } } }, // Включаем купленные предметы
  });

  if (!player) {
    throw new HttpException('Player not found', HttpStatus.NOT_FOUND);
  }

  this.logger.log(`Player ${tgId} requested items`);

  // Получаем все категории с товарами, подходящими для ранка игрока
  const categories = await this.prisma.category.findMany({
    include: {
      items: {
        where: { rank: player.rank }, // Фильтруем товары по рангу игрока
        include: { dependencies: true }, // Включаем зависимости предметов
      },
    },
  });

  // Список ID предметов, которые игрок уже купил
  const playerItemIds = player.items.map((itemOnPlayer) => itemOnPlayer.itemId);

  // Создаем результат, который будет массивом с категориями
  const result = categories.map((category) => {
    // Три массива для каждой категории
    const purchasedItems = [];
    const availableItems = [];
    const unavailableItems = [];

    // Для каждого предмета в категории проверяем его статус
    for (const item of category.items) {
      if (playerItemIds.includes(item.id)) {
        // Если предмет уже куплен, добавляем в массив купленных
        purchasedItems.push(item);
      } else {
        // Если предмет не куплен, проверяем выполнены ли его зависимости
        const dependenciesMet = item.dependencies.every((dep) =>
          playerItemIds.includes(dep.dependsOnId) // Проверяем ID зависимостей
        );

        if (dependenciesMet) {
          // Если все зависимости выполнены, добавляем в доступные для покупки
          availableItems.push(item);
        } else {
          // Иначе добавляем в недоступные
          unavailableItems.push(item);
        }
      }
    }

    // Возвращаем объект категории с тремя массивами предметов
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

