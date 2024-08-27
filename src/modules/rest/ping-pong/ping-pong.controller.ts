import { Controller, Get, Post } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  //ApiBearerAuth,
} from '@nestjs/swagger';


@ApiTags('ping-pong')
@Controller('ping-pong')
export class PingPongController {
    
    @Get("/debug-sentry")
    /**
     * This endpoint is used to test Sentry error reporting.
     * It should throw an error with a descriptive message.
     *
     * @returns {never}
     */
    @ApiOperation({ summary: 'Throw an error to test Sentry.' })
    @ApiResponse({ status: 500, description: 'Internal Server Error.' })
    getError() {
        throw new Error('My first Sentry error!');
    }

    @Get("/ping")
    /**
     * This endpoint is used to test Sentry error reporting.
     * It should return "pong" message with 200 status code.
     *
     * @returns {never}
     */
    @ApiOperation({ summary: 'Throw an error to test Sentry.' })
    @ApiResponse({ status: 500, description: 'Internal Server Error.' })
    getPong() {
        return "pong"
    }
}

