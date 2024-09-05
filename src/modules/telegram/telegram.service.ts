import { TelegramUserType } from '@/helpers/types/telegram-user.type';
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { AppConfigService } from '../config/config.service';

@Injectable()
export class TelegramService {
    constructor(
        private readonly config: AppConfigService) {}

  validateInitData(initData: string): boolean {
    const token = this.config.getTelegramBotToken();
    const secretKey = crypto.createHash('sha256').update(token).digest()
    const parsedData = new URLSearchParams(initData);
    
    const checkString = [...parsedData.entries()]
      .filter(([key]) => key !== 'hash')
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')

    const hash = parsedData.get('hash')
    const hmac = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex')

    return hmac === hash;
  }

  extractUserData(initData: string): TelegramUserType {
    const parsedData = new URLSearchParams(initData);
    return {
      id: parsedData.get('id'),
      first_name: parsedData.get('first_name'),
      last_name: parsedData.get('last_name'),
      username: parsedData.get('username'),
      photo_url: parsedData.get('photo_url'),
    } as TelegramUserType;
  }
}