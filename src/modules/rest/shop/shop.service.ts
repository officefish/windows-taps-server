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
          { name: 'School', income: 50, cost: 300, imageUrl:'shop/mind/school.png', dependencies: [] },
          { name: 'Institute', income: 300, cost: 3500, imageUrl:'shop/mind/university.png', dependencies: [{name:'School', level: 1}] },
          { name: 'Friends', income: 120, cost: 800, imageUrl:'shop/mind/friends.png', dependencies: [] },
        ],
        PHYSICAL_EDUCATION: [
          { name: 'Exercises', income: 150, cost: 750, imageUrl:'shop/sport/workout.png', dependencies: [] },
          { name: 'Gym', income: 200, cost: 1000, imageUrl:'shop/sport/gym.png', dependencies: [{name:'Exercises', level: 1}] },
        ],
        CLOTHES: [
          { name: 'Cap', income: 50, cost: 300, imageUrl:"shop/clothes/cap.png", dependencies: [] },
          { name: 'Raincoat', income: 50, cost: 300, imageUrl:"shop/clothes/raincoat.png", dependencies: [] },
          { name: 'Boots', income: 50, cost: 300, imageUrl:"shop/clothes/sneakers.png", dependencies: [] },
          { name: 'Jacket', income: 100, cost: 500, imageUrl:"shop/clothes/jacket.png", dependencies: [] },
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
              name: dependencyName,
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
        item.level = player.items.find((i) => i.itemId === item.id).level;
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

  async buyItem(tgId: string, itemId: string) {
    // Найти игрока по tgId
    const player = await this.prisma.player.findUnique({
      where: { tgId: tgId },
      include: { items: true }, // Включаем список купленных предметов
    });

    if (!player) {
      throw new HttpException('Player not found', HttpStatus.NOT_FOUND);
    }

    // Найти предмет по itemId
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
      include: { dependencies: true }, // Включаем зависимости предмета
    });

    if (!item) {
      throw new HttpException('Item not found', HttpStatus.NOT_FOUND);
    }

    // Проверить, соответствует ли ранг игрока рангу предмета
    if (item.rank !== player.rank) {
      throw new HttpException('This item is not available for your rank', HttpStatus.FORBIDDEN);
    }

    // Проверить, не был ли предмет уже куплен
    const alreadyOwned = player.items.some(playerItem => playerItem.itemId === itemId);
    if (alreadyOwned) {
      throw new HttpException('You have already purchased this item', HttpStatus.CONFLICT);
    }

    // Проверить, выполнены ли все зависимости предмета
    const playerItemIds = player.items.map(playerItem => playerItem.itemId);
    const dependenciesMet = item.dependencies.every(dep => playerItemIds.includes(dep.dependsOnId));

    if (!dependenciesMet) {
      throw new HttpException('You have not met all the dependencies for this item', HttpStatus.FORBIDDEN);
    }

    // Проверить, достаточно ли у игрока средств для покупки предмета
    if (player.balance < item.price) {
      throw new HttpException('Not enough balance to purchase this item', HttpStatus.BAD_REQUEST);
    }

    // Вычитаем стоимость предмета из баланса игрока
    const playerUpdate = await this.prisma.player.update({
      where: { tgId: tgId },
      data: { balance: player.balance - item.price },
    });

    // Добавляем предмет в инвентарь игрока
    await this.prisma.itemOnPlayer.create({
      data: {
        playerId: player.id,
        itemId: item.id,
      },
    });

    const categories = await this.getItemsForPlayer(tgId);
    const balance = playerUpdate.balance

    const incomePerHour = await this.recalculateIncomePerHour(tgId);
    this.logger.log(`Recalculated income for player ${tgId}: ${incomePerHour}`);

    return { categories, balance, incomePerHour };
  }

  // Функция для пересчета пассивного дохода игрока
  async recalculateIncomePerHour(tgId: string) {
    // Найти игрока и его предметы
    const player = await this.prisma.player.findUnique({
      where: { tgId },
      include: {
        items: {
          include: { item: true }, // Включаем информацию о предметах
        },
      },
    });

    if (!player) {
      throw new Error('Player not found');
    }

    // Рассчитываем пассивный доход
    let totalIncomePerHour = 0;

    for (const playerItem of player.items) {
      const item = playerItem.item;
      const level = playerItem.level;

      // Полный доход предмета: базовый доход + 10% от базового дохода, умноженного на уровень предмета
      const itemIncome = item.income + (item.income * 0.1 * (level - 1))

      // Добавляем доход предмета к общему доходу
      totalIncomePerHour += itemIncome;
    }

    // Обновляем поле incomePerHour у игрока
    await this.prisma.player.update({
      where: { tgId },
      data: {
        incomePerHour: totalIncomePerHour,
      },
    });

    return totalIncomePerHour; // Возвращаем итоговый доход
  }

  // Функция для улучшения предмета
  async upgradeItem(tgId: string, itemId: string) {
    // Найти игрока и его предметы
    const player = await this.prisma.player.findUnique({
      where: { tgId },
      include: {
        items: {
          include: { item: true }, // Включаем информацию о предмете
        },
      },
    });

    if (!player) {
      throw new HttpException('Player not found', HttpStatus.NOT_FOUND);
    }

    // Найти предмет у игрока
    const playerItem = player.items.find(pi => pi.itemId === itemId);

    if (!playerItem) {
      throw new HttpException('Item not found in your inventory', HttpStatus.NOT_FOUND);
    }

    // Проверить максимальный уровень предмета
    if (playerItem.level >= 10) {
      throw new HttpException('Item is already at max level', HttpStatus.BAD_REQUEST);
    }

    // Рассчитать стоимость улучшения (10% от цены предмета)
    const upgradeCost = (playerItem.item.price * 0.1) * playerItem.level;

    // Проверить, есть ли у игрока достаточно средств
    if (player.balance < upgradeCost) {
      throw new HttpException('Not enough balance to upgrade the item, need ' + upgradeCost + ' , balance is ' + player.balance + '', HttpStatus.BAD_REQUEST);
    }

    // Увеличить уровень предмета
    const newLevel = playerItem.level + 1;

    // Обновить данные в базе: уровень предмета и баланс игрока
    await this.prisma.itemOnPlayer.update({
      where: { id: playerItem.id },
      data: {
        level: newLevel,
      },
    });

    const playerUpdate =await this.prisma.player.update({
      where: { tgId },
      data: {
        balance: player.balance - upgradeCost,
      },
    });

    const categories = await this.getItemsForPlayer(tgId);
    const balance = playerUpdate.balance

    const incomePerHour = await this.recalculateIncomePerHour(tgId);
    this.logger.log(`Recalculated income for player ${tgId}: ${incomePerHour}`);

    return { categories, balance, incomePerHour };
  }

}

