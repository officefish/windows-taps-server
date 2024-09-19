import { TelegramUserType } from '@/helpers/types/telegram-user.type';
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { AppConfigService } from '../config/config.service';
import * as qs from 'querystring'; // Use querystring to easily parse URL-encoded strings
import { HttpService } from '@nestjs/axios';

@Injectable()
export class TelegramService {
    constructor(
        private readonly config: AppConfigService,
        private readonly httpService: HttpService
      ) {}

  getTelegramApiUrl() {
    return `https://api.telegram.org/bot${this.config.getTelegramBotToken()}`
  }     
      
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

  }

  extractUserData(initData: string): TelegramUserType {
    const parsedData = qs.parse(initData);

    // Decode and parse the `user` field, which is a JSON-encoded string
    const userJson = parsedData['user'] as string;
    const userData = JSON.parse(decodeURIComponent(userJson));

    // Map the parsed data to the TelegramUserType and return it
    const user: TelegramUserType = {
      id: userData.id.toString(),
      firstName: userData.first_name,
      lastName: userData.last_name || undefined,
      username: userData.username || undefined,
      language_code: userData.language_code || undefined,
      allows_write_to_pm: userData.allows_write_to_pm || undefined,
    };
    
    return user;
  }

  // Проверка статуса пользователя в канале
  async checkUserSubscription(channelUsername: string, tgId: string): Promise<boolean> {
    try {
      const url = `${this.getTelegramApiUrl()}/getChatMember?chat_id=@${channelUsername}&user_id=${tgId}`;
      const response = await this.httpService.get(url).toPromise();
      const data = response.data;

      // Проверяем статус пользователя
      const status = data.result.status;
      return status === 'member' || status === 'administrator' || status === 'creator';
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }
}