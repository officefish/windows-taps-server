import { ApiProperty } from '@nestjs/swagger'

// Описание зависимостей предметов
class ItemDependency {
  @ApiProperty({ description: 'ID зависимого предмета' })
  dependencyItemId: string;

  @ApiProperty({ description: 'технический ID самой зависимости' })
  id: string;
  
  @ApiProperty({ description: 'ID предмета нуждающегося в другом предмете' })
  itemId: string; 
  
  @ApiProperty({ description: 'Необходимый зависимого уровень предмета' })
  level: number;
}

// Описание товара (item)
class Item {
  @ApiProperty({ description: 'ID предмета' })
  id: string;

  @ApiProperty({ description: 'Название предмета' })
  name: string;

  @ApiProperty({ description: 'Описание предмета' })
  description: string;

  @ApiProperty({ description: 'Изображение предмета' })
  imageUrl: string;

  @ApiProperty({ description: 'Цена предмета' })
  price: number;

  @ApiProperty({ description: 'Уровень предмета' })
  level?: number;

  @ApiProperty({ description: 'Пассивный доход от предмета' })
  income: number;

  @ApiProperty({ description: 'Ранг, для которого доступен предмет' })
  rank: string;

  @ApiProperty({ type: [ItemDependency], description: 'Зависимости предмета' })
  dependencies: ItemDependency[];
}

// Описание категории
class Category {
  @ApiProperty({ description: 'Название категории' })
  categoryName: string;

  @ApiProperty({ type: [Item], description: 'Купленные предметы в категории' })
  purchased: Item[];

  @ApiProperty({ type: [Item], description: 'Доступные для покупки предметы в категории' })
  available: Item[];

  @ApiProperty({ type: [Item], description: 'Недоступные для покупки предметы в категории' })
  unavailable: Item[];
}

// Общий ответ, который содержит список категорий
export class GetItemsForPlayerResponse {
  @ApiProperty({ type: [Category], description: 'Категории с предметами для игрока' })
  categories: Category[];
}

export class BuyItemResponse {
  @ApiProperty({ type: [Category], description: 'Категории с предметами для игрока' })
  categories: Category[];

  @ApiProperty({description: 'Баланс игрока' })
  balance: number;
}