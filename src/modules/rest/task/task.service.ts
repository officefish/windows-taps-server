import { HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
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
            title: 'Ежидневная награда',
            baunty: 150,
            bonus: 30
          },
          {
            type: TaskType.DAILY_MINIGAME,
            title: 'Мини игра',
          }
        ],
        season: [
            { 
                type: TaskType.INVITE_COUNT,
                title: 'Пригласи трех друзей',
                target: 3,
                baunty: 2000,
                expiresAt,
            },
            { 
                type: TaskType.SUBSCRIBE_CHANNEL,
                content: 'portal_okon',
                navigate: 'https://t.me/portal_okon',
                title: 'Подпишись на канал',
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

    const playerTasks = await this.prisma.taskOnPlayer.findMany({
      where: {
        playerId: player.id,
      },
      include: {
        templateTask: true, // Включаем информацию о шаблоне задания
      },
    })
    if (playerTasks.length > 0) {
      return playerTasks
    }

    //Извлекаем активные задачи (например, не просроченные и ежедневные)
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
    // const playerTasks = await this.prisma.taskOnPlayer.findMany({
    //   where: {
    //     playerId: player.id,
    //     templateTaskId: { in: availableTasks.map(task => task.id) },
    //   },
    // });

    // const existingTaskIds = playerTasks.map(pt => pt.templateTaskId);

    // // Оставляем только те задания, которые еще не назначены игроку
    // const newTasks = availableTasks.filter(task => !existingTaskIds.includes(task.id));

    // Создаем новые задания для игрока с использованием connect
    const taskPromises = availableTasks.map(task => this.prisma.taskOnPlayer.create({
      data: {
        templateTask: {
          connect: { id: task.id }, // связываем существующую задачу через connect
        },
        player: {
          connect: { id: player.id }, // связываем существующего игрока через connect
        },
        status: TaskStatus.PENDING
      },
      include: {
        templateTask: true, // Включаем информацию о шаблоне задания
      },
    }));

    await Promise.all(taskPromises);
    // // Возвращаем список всех задач игрока, включая уже существующие и новые
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

     // Process tasks with async/await and map to return updated tasks
    await Promise.all(
      allPlayerTasks.map(async (task) => {
        switch (task.templateTask.type) {
          case TaskType.SUBSCRIBE_CHANNEL:
            return this.checkSubscription(player, task, task.templateTask);
          case TaskType.INVITE_COUNT:
            return this.checkInviteCount(player, task, task.templateTask);
          case TaskType.DAILY_MINIGAME:
            return this.checkDailyMinigame(player, task);
          case TaskType.DAILY_BAUNTY:
            return this.checkDailyBaunty(player, task);
          default:
            return task; // Return the task unchanged if no specific logic is needed
        }
      })
    );

    const updatedTasks = await this.prisma.taskOnPlayer.findMany({
      where: { playerId: player.id },
      include: {
        templateTask: true, // Включаем информацию о шаблоне задания
      },
    });
    return updatedTasks;

  }

  async checkSubscription(player: Player, taskOnPlayer: TaskOnPlayer, task: Task) {

    if (taskOnPlayer.status === TaskStatus.COMPLETED 
      || taskOnPlayer.status === TaskStatus.READY) {
      return 
    }

    const isSubscribed = await this.telegram.checkUserSubscription(task.content, player.tgId)
    if (!isSubscribed) {
      return 
    }

    await this.prisma.taskOnPlayer.update({
      where: { id: taskOnPlayer.id },
      data: { status: TaskStatus.READY },
    })

    await this.prisma.player.update({
      where: { id: player.id },
      data: { balance: { increment: task.baunty } },
    })

  }

  // Проверка количества приглашений
  async checkInviteCount(player: Player, taskOnPlayer: TaskOnPlayer, task:Task) {
    const referrals = await this.prisma.referral.findMany({
      where: { referrerId: player.id },
    })

    if (taskOnPlayer.status === TaskStatus.COMPLETED 
      || taskOnPlayer.status === TaskStatus.READY) {
      return 
    }

    if (!referrals || referrals.length === 0) {
      return 
    }

    if (referrals.length < task.target) {
      await this.prisma.taskOnPlayer.update({
        where: { id: taskOnPlayer.id },
        data: { status: TaskStatus.IN_PROGRESS },
      })
      return 
    }

    await this.prisma.taskOnPlayer.update({
      where: { id: taskOnPlayer.id },
      data: { status: TaskStatus.READY },
    })
  }

  async checkDailyMinigame(player: Player, task: TaskOnPlayer) {
    const status = await this.quest.isGameAvailable(player);
    if (status.isBlocked) {
      
      // we also can change task status to pending or completed depends on remaining time
      await this.prisma.taskOnPlayer.update({
        where: { id: task.id },
        data: { status: TaskStatus.COMPLETED },
      })
      return
    } 

    await this.prisma.taskOnPlayer.update({
      where: { id: task.id },
      data: { status: TaskStatus.PENDING },
    })
  }

  async checkDailyBaunty(player: Player, taskOnPlayer: TaskOnPlayer) {
    const { claimedToday } = await this.quest.getDailyRewardInfo(player);
    if (claimedToday) {
      await this.prisma.taskOnPlayer.update({
        where: { id: taskOnPlayer.id },
        data: { status: TaskStatus.COMPLETED },
      })
      return
    } 
    await this.prisma.taskOnPlayer.update({
      where: { id: taskOnPlayer.id },
      data: { status: TaskStatus.PENDING },
    })
  }

  async getTaskBaunty(player: Player, taskId: string) {
    const task = await this.prisma.taskOnPlayer.findUnique({
      where: { id: taskId },
      include: {
        templateTask: true, // Включаем информацию о шаблоне задания
      },
    })
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if(task.status === TaskStatus.COMPLETED) {
      throw new HttpException('Task already completed', HttpStatus.BAD_REQUEST);
    }

    if(task.status === TaskStatus.READY) {
      
      await this.prisma.taskOnPlayer.update({
        where: { id: task.id },
        data: { status: TaskStatus.COMPLETED },
      })

      await this.prisma.player.update({
        where: { id: player.id },
        data: { balance: { increment: task.templateTask.baunty } },
      })
    }
    
    const updatedTasks = await this.prisma.taskOnPlayer.findMany({
      where: { playerId: player.id },
      include: {
        templateTask: true, // Включаем информацию о шаблоне задания
      },
    });
    return updatedTasks;

  }

}

