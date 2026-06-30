import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private readonly ENGINE_URL = 'http://127.0.0.1:8000';
  private readonly redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

  async getDashboardMetrics(organizationId: string) {
    try {
      const cacheKey = `analytics:dashboard:${organizationId}`;
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const response = await fetch(`${this.ENGINE_URL}/dashboard?org_id=${organizationId}`);
      if (!response.ok) {
        throw new Error(`Python Engine returned ${response.status}`);
      }
      
      const data = await response.json();
      await this.redis.set(cacheKey, JSON.stringify(data), 'EX', 300);
      return data;
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
      const cacheKey = `analytics:anomalies:${organizationId}`;
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const response = await fetch(`${this.ENGINE_URL}/anomalies?org_id=${organizationId}`);
      if (!response.ok) throw new Error('Failed to fetch anomalies');
      
      const data = await response.json();
      await this.redis.set(cacheKey, JSON.stringify(data), 'EX', 300);
      return data;
    } catch (error) {
      this.logger.error(`Failed to fetch anomalies: ${error}`);
      return [];
    }
  }
}
