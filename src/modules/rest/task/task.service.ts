import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from "@/modules/prisma/prisma.service"; // Подключаем сервис Prisma
import { TaskType, TaskStatus, Player, TaskOnPlayer, Task } from '@prisma/client';
import { QuestService } from '../quest/quest.service';
import { TelegramService } from '@/modules/telegram/telegram.service';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);
  
  constructor(
    private readonly prisma: PrismaService, // Ensure proper readonly
    private readonly quest: QuestService,
    private readonly telegram: TelegramService
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
                content: 'kubiki_io',
                navigate: 'https://t.me/kubiki_io',
                title: 'Subscribe channel',
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

    return allPlayerTasks;
  }

  async checkCurrentTaskStatus(player: Player) {
    const allPlayerTasks = await this.prisma.taskOnPlayer.findMany({
      where: { playerId: player.id },
      include: {
        templateTask: true, // Включаем информацию о шаблоне задания
      },
    });

    const updatedTasks = allPlayerTasks.map(task => {
      switch (task.templateTask.type) {
        case TaskType.SUBSCRIBE_CHANNEL:
          this.checkSubscription(player, task, task.templateTask)
          break;
        case TaskType.INVITE_COUNT:
          this.checkInviteCount(player, task, task.templateTask)
          break;
        case TaskType.DAILY_MINIGAME:
          this.checkDailyMinigame(player, task)
          break;
        case TaskType.DAILY_BAUNTY:
          this.checkDailyBaunty(player, task)
          break;
      }
    });

    return updatedTasks;
  }

  async checkSubscription(player: Player, taskOnPlayer: TaskOnPlayer, task: Task) {

    if (taskOnPlayer.status === TaskStatus.COMPLETED) {
      return taskOnPlayer
    }

    const isSubscribed = await this.telegram.checkUserSubscription(task.content, player.tgId)
    if (!isSubscribed) {
      return taskOnPlayer
    }

    const newTaskOnPlayer = await this.prisma.taskOnPlayer.update({
      where: { id: taskOnPlayer.id },
      data: { status: TaskStatus.COMPLETED },
    })

    await this.prisma.player.update({
      where: { id: player.id },
      data: { balance: { increment: task.baunty } },
    })

    return newTaskOnPlayer
  }

  // Проверка количества приглашений
  async checkInviteCount(player: Player, taskOnPlayer: TaskOnPlayer, task:Task) {
    const referrals = await this.prisma.referral.findMany({
      where: { referrerId: player.id },
    })

    if (taskOnPlayer.status === TaskStatus.COMPLETED) {
      return taskOnPlayer
    }

    if (!referrals || referrals.length === 0) {
      return taskOnPlayer
    }

    if (referrals.length < task.target) {
      const newTaskOnPlayer = await this.prisma.taskOnPlayer.update({
        where: { id: taskOnPlayer.id },
        data: { status: TaskStatus.IN_PROGRESS },
      })
      return newTaskOnPlayer
    }

    const newTaskOnPlayer = await this.prisma.taskOnPlayer.update({
      where: { id: taskOnPlayer.id },
      data: { status: TaskStatus.COMPLETED },
    })

    await this.prisma.player.update({
      where: { id: player.id },
      data: { balance: { increment: task.baunty } },
    })

    return newTaskOnPlayer
  }

  async checkDailyMinigame(player: Player, task: TaskOnPlayer) {
    // TODO: Проверка дневного мини-игрового задания
    return task
  }

  async checkDailyBaunty(player: Player, taskOnPlayer: TaskOnPlayer) {
    const { claimedToday } = await this.quest.getDailyRewardInfo(player.tgId);
    if (claimedToday) {
      const newTaskOnPlayer = await this.prisma.taskOnPlayer.update({
        where: { id: taskOnPlayer.id },
        data: { status: TaskStatus.COMPLETED },
      })
  
      return newTaskOnPlayer
    } 
    const newTaskOnPlayer = await this.prisma.taskOnPlayer.update({
      where: { id: taskOnPlayer.id },
      data: { status: TaskStatus.PENDING },
    })
    return newTaskOnPlayer
  }

}

