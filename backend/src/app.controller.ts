import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('api/health')
  getApiHealth(): { status: string; service: string; timestamp: string } {
    return {
      status: 'healthy',
      service: 'sysdesk-backend',
      timestamp: new Date().toISOString(),
    };
  }
}
