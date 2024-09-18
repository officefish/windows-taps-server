import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from "@/modules/prisma/prisma.service"; // Подключаем сервис Prisma
import { TaskType, TaskStatus } from '@prisma/client';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);
  
  constructor(
    private readonly prisma: PrismaService, // Ensure proper readonly
  ) {}

  async brootforceCreateTasks() {
    // Проверяем, существуют ли категории
    const existingTasks = await this.prisma.task.findMany();
    if (existingTasks.length > 0) {
      console.log('Tasks already exists');
      return;
    }

    // Если не ежедневное, установите срок истечения через 3 месяца
    const expiresAt = new Date(new Date().setMonth(new Date().getMonth() + 3)); 

     // Создание категорий и товаров
      const tasks = {
        daily: [
          { 
            type: TaskType.DAILY_BAUNTY,
            title: 'Daily baunty',
            baunty: 150,
            bonus: 30
          },
          {
            type: TaskType.DAILY_MINIGAME,
            title: 'Daily minigame',
          }
        ],
        season: [
            { 
                type: TaskType.INVITE_COUNT,
                title: 'Invite count',
                target: 3,
                baunty: 2000,
                expiresAt,
            },
            { 
                type: TaskType.SUBSCRIBE_CHANNEL,
                content: '',
                navigate: '',
                title: 'Invite count',
                baunty: 2000,
                expiresAt,
            }
        ]
      };

      await this.createTaskTemplates(true, tasks.daily);
      await this.createTaskTemplates(false, tasks.season);
    
      this.logger.log('Task templates success added');
  }

  // Функция для создания товаров с зависимостями
  async createTaskTemplates(daily: boolean, tasks: any[]) {

      // Создаем товары для этой категории
  const taskPromises = [];
  for (const task of tasks) {

    const promise = this.prisma.task.create({
      data: {
        type: task.type,
        title: task.title,
        description: task.description,
        baunty: task.baunty,
        bonus: task.bonus,
        isDaily: daily,
        content: task.content,
        navigate: task.navigate,
        target: task.target,
        expiresAt: task.expiresAt, // Устанавливаем срок истечения, если задание не ежедневное
      },
    });
    taskPromises.push(promise);
  }

    await Promise.all(taskPromises);
  }

  async getTasksForPlayer(tgId: string) {
    // Находим игрока по его Telegram ID
    const player = await this.prisma.player.findUnique({
      where: { tgId: tgId },
    });

    if (!player) {
      throw new Error(`Player with tgId ${tgId} not found`);
    }

    // Извлекаем активные задачи (например, не просроченные и ежедневные)
    // const availableTasks = await this.prisma.task.findMany({
    //   where: {
    //     OR: [
    //       { isDaily: true }, // ежедневные задания
    //       { expiresAt: { gte: new Date() } }, // задания с активным сроком действия
    //     ],
    //   },
    // });
    const availableTasks = await this.prisma.task.findMany({})

    // Проверяем, какие задания уже существуют для игрока
    const playerTasks = await this.prisma.taskOnPlayer.findMany({
      where: {
        playerId: player.id,
        templateTaskId: { in: availableTasks.map(task => task.id) },
      },
    });

    const existingTaskIds = playerTasks.map(pt => pt.templateTaskId);

    // Оставляем только те задания, которые еще не назначены игроку
    const newTasks = availableTasks.filter(task => !existingTaskIds.includes(task.id));

    // Создаем новые задания для игрока с использованием connect
    const taskPromises = newTasks.map(task => this.prisma.taskOnPlayer.create({
      data: {
        templateTask: {
          connect: { id: task.id }, // связываем существующую задачу через connect
        },
        player: {
          connect: { id: player.id }, // связываем существующего игрока через connect
        },
        status: TaskStatus.PENDING
      },
    }));

    await Promise.all(taskPromises);

    // Возвращаем список всех задач игрока, включая уже существующие и новые
    const allPlayerTasks = await this.prisma.taskOnPlayer.findMany({
      where: { playerId: player.id },
      include: {
        templateTask: true, // Включаем информацию о шаблоне задания
      },
    });

    // Проверяем, являентся ли задание уже выполненным
    // TODO: Реализовать проверку выполнения задания

    return allPlayerTasks;
  }

}

