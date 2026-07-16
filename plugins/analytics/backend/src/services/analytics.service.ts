import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private readonly ENGINE_URL = process.env.ANALYTICS_ENGINE_URL || 'http://analytics-engine:8000';
  private readonly redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379');

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

  async getForecasts(organizationId: string) {
    try {
      const cacheKey = `analytics:forecasts:${organizationId}`;
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const response = await fetch(`${this.ENGINE_URL}/forecast?org_id=${organizationId}`);
      if (!response.ok) throw new Error('Failed to fetch forecasts');
      
      const data = await response.json();
      await this.redis.set(cacheKey, JSON.stringify(data), 'EX', 300);
      return data;
    } catch (error) {
      this.logger.error(`Failed to fetch forecasts: ${error}`);
      return [];
    }
  }

  async generateReport(organizationId: string) {
    try {
      const response = await fetch(`${this.ENGINE_URL}/reports/generate?org_id=${organizationId}`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to generate report');
      
      return await response.json();
    } catch (error) {
      this.logger.error(`Failed to generate report: ${error}`);
      throw error;
    }
  }

  async getTimeseries(organizationId: string) {
    try {
      const cacheKey = `analytics:timeseries:${organizationId}`;
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const response = await fetch(`${this.ENGINE_URL}/timeseries?org_id=${organizationId}`);
      if (!response.ok) {
        throw new Error(`Python Engine timeseries returned ${response.status}`);
      }
      
      const data = await response.json();
      await this.redis.set(cacheKey, JSON.stringify(data), 'EX', 300);
      return data;
    } catch (error) {
      this.logger.error(`Failed to fetch timeseries from engine: ${error}`);
      return {};
    }
  }
}
