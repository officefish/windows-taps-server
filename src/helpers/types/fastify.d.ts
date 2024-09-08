import 'fastify';
import { PlayersTokenDto } from '@/modules/token/dto';

declare module 'fastify' {
  interface FastifyRequest {
    currentUser?: PlayersTokenDto; // Добавляем поле currentUser
  }
}