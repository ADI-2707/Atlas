import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private readonly ENGINE_URL = 'http://127.0.0.1:8000';

  async getDashboardMetrics(organizationId: string) {
    try {
      const response = await fetch(`${this.ENGINE_URL}/dashboard?org_id=${organizationId}`);
      if (!response.ok) {
        throw new Error(`Python Engine returned ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      this.logger.error(`Failed to fetch analytics from engine: ${error}`);
      return {
        overview: { totalRevenue: 0, activeUsers: 0 },
        sales: [],
        hr: [],
        inventory: []
      };
    }
  }

  async getAnomalies(organizationId: string) {
    try {
      const response = await fetch(`${this.ENGINE_URL}/anomalies?org_id=${organizationId}`);
      if (!response.ok) throw new Error('Failed to fetch anomalies');
      return await response.json();
    } catch (error) {
      this.logger.error(`Failed to fetch anomalies: ${error}`);
      return [];
    }
  }
}
