import { Controller, Get, Post, Request, SetMetadata } from '@nestjs/common';
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

  @Get('forecasts')
  @RequirePermissions('analytics.forecasts')
  async getForecasts(@Request() req: AuthenticatedRequest) {
    return this.analyticsService.getForecasts(req.user.organizationId);
  }

  @Post('reports/generate')
  @RequirePermissions('analytics.reports')
  async generateReport(@Request() req: AuthenticatedRequest) {
    return this.analyticsService.generateReport(req.user.organizationId);
  }

  @Get('timeseries')
  @RequirePermissions('analytics.read')
  async getTimeseries(@Request() req: AuthenticatedRequest) {
    return this.analyticsService.getTimeseries(req.user.organizationId);
  }

  @Post('sync')
  @RequirePermissions('analytics.read')
  async forceSync(@Request() req: AuthenticatedRequest) {
    return this.analyticsService.forceSync(req.user.organizationId);
  }
}
