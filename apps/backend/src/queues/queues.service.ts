import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import { getRedisConfig } from '@atlas/utils';

@Injectable()
export class QueuesService implements OnModuleInit, OnModuleDestroy {
  private auditLogQueue!: Queue;
  private notificationQueue!: Queue;

  onModuleInit() {
    const redisConfig = getRedisConfig();
    const connection = {
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
    };

    this.auditLogQueue = new Queue('audit-log', { connection });
    this.notificationQueue = new Queue('notification', { connection });
  }

  async addAuditJob(data: any) {
    await this.auditLogQueue.add('log', data, {
      removeOnComplete: true,
      removeOnFail: false,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });
  }

  async addNotificationJob(data: any) {
    await this.notificationQueue.add('deliver', data, {
      removeOnComplete: true,
      removeOnFail: false,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });
  }

  async onModuleDestroy() {
    await this.auditLogQueue.close();
    await this.notificationQueue.close();
  }
}
