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
            },
            { 
                type: TaskType.SUBSCRIBE_CHANNEL,
                content: '',
                navigate: '',
                title: 'Invite count',
                baunty: 2000,
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
         },
       });
       taskPromises.push(promise);
     }

    await Promise.all(taskPromises);
  }

  // Создаем категории и товары


}

