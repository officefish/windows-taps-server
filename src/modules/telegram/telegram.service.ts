import { TelegramUserType } from '@/helpers/types/telegram-user.type';
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { AppConfigService } from '../config/config.service';
import * as qs from 'querystring'; // Use querystring to easily parse URL-encoded strings

@Injectable()
export class TelegramService {
    constructor(
        private readonly config: AppConfigService) {}

  validateInitData(initData: string): boolean {
    const token = this.config.getTelegramBotToken();

    const parsedData = new URLSearchParams( initData );

    parsedData.sort();

    const hash = parsedData.get( "hash" );
    parsedData.delete( "hash" );

    const dataToCheck = [...parsedData.entries()].map( ( [key, value] ) => key + "=" + value ).join( "\n" );

    const secretKey = crypto.createHmac( "sha256", "WebAppData" ).update( token ).digest();

    const hmac = crypto.createHmac( "sha256", secretKey ).update( dataToCheck ).digest( "hex" );

    console.log('hmac: ', hmac);
    console.log('hash: ', hash);

    return hash === hmac;

    // // Шаг 1: Генерируем secretKey
    // const secretKey = crypto.createHmac('sha256', token).update('WebAppData').digest();
  
    // // Шаг 2: Парсим initData
    // const parsedData = new URLSearchParams(initData);
  
    // // Шаг 3: Формируем строку checkString
    // const checkString = [...parsedData.entries()]
    //   .filter(([key]) => key !== 'hash')  // Исключаем 'hash'
    //   .sort(([a], [b]) => a.localeCompare(b))  // Сортируем ключи по алфавиту
    //   .map(([key, value]) => `${key}=${value}`)  // Форматируем как key=value
    //   .join('\n');  // Разделяем символом перевода строки
  
    // console.log('CheckString:', checkString);  // Логируем для проверки
  
    // // Шаг 4: Получаем hash из parsedData
    // const hash = parsedData.get('hash');
  
    // // Шаг 5: Генерируем HMAC с использованием secretKey и checkString
    // const hmac = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

    // console.log('hash', hash);  // Логируем для проверки
    // console.log('hmac', hmac);  // Логируем для проверки

    // // Шаг 6: Сравниваем с переданным hash
    // return hmac === hash;
  }

  extractUserData(initData: string): TelegramUserType {
    const parsedData = qs.parse(initData);

    // Decode and parse the `user` field, which is a JSON-encoded string
    const userJson = parsedData['user'] as string;
    const userData = JSON.parse(decodeURIComponent(userJson));

    // Map the parsed data to the TelegramUserType and return it
    const user: TelegramUserType = {
      id: userData.id.toString(),
      first_name: userData.first_name,
      last_name: userData.last_name || undefined,
      username: userData.username || undefined,
      language_code: userData.language_code || undefined,
      allows_write_to_pm: userData.allows_write_to_pm || undefined,
    };
    
    return user;
  }
}