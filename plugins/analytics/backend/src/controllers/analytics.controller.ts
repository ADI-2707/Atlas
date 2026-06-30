import { Controller, Get, Request, SetMetadata } from '@nestjs/common';
import { AnalyticsService } from '../services/analytics.service';

export const RequirePermissions = (...permissions: string[]) => SetMetadata('permissions', permissions);

interface AuthenticatedRequest {
  user: {
    organizationId: string;
  };
}

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @RequirePermissions('analytics.read')
  async getDashboard(@Request() req: AuthenticatedRequest) {
    return this.analyticsService.getDashboardMetrics(req.user.organizationId);
  }

  @Get('anomalies')
  @RequirePermissions('analytics.anomalies')
  async getAnomalies(@Request() req: AuthenticatedRequest) {
    return this.analyticsService.getAnomalies(req.user.organizationId);
  }
}
