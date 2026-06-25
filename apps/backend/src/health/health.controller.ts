import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../auth/decorators/public.decorator';

@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getHealth() {
    let dbStatus = 'up';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (e) {
      dbStatus = 'down';
    }

    const healthy = dbStatus === 'up';

    return {
      message: healthy ? 'System is healthy' : 'System is degraded',
      data: {
        status: healthy ? 'up' : 'down',
        timestamp: new Date().toISOString(),
        services: {
          database: dbStatus,
        },
      },
    };
  }
}
