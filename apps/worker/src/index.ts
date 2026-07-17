import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from repo root .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { getRedisConfig } from '@atlas/utils';
import { processAuditLogJob } from './jobs/audit-log.processor';
import { processNotificationJob } from './jobs/notification.processor';

async function bootstrap() {
  console.log('[Worker] Bootstrapping background job worker service...');
  const prisma = new PrismaClient();
  const redisConfig = getRedisConfig();
  const connection = {
    host: redisConfig.host,
    port: redisConfig.port,
    password: redisConfig.password,
  };

  console.log(`[Worker] Connecting to Redis at ${connection.host}:${connection.port}`);

  // Create BullMQ Worker for audit-log
  const auditWorker = new Worker(
    'audit-log',
    async (job) => {
      await processAuditLogJob(job, prisma);
    },
    { connection }
  );

  // Create BullMQ Worker for notification
  const notificationWorker = new Worker(
    'notification',
    async (job) => {
      await processNotificationJob(job, prisma);
    },
    { connection }
  );

  auditWorker.on('completed', (job) => {
    console.log(`[Worker] Job audit-log:${job.id} completed successfully.`);
  });

  auditWorker.on('failed', (job, err) => {
    console.error(`[Worker] Job audit-log:${job?.id} failed:`, err);
  });

  notificationWorker.on('completed', (job) => {
    console.log(`[Worker] Job notification:${job.id} completed successfully.`);
  });

  notificationWorker.on('failed', (job, err) => {
    console.error(`[Worker] Job notification:${job?.id} failed:`, err);
  });

  console.log('[Worker] Background worker service is running. Press Ctrl+C to terminate.');

  // Clean shutdown
  const gracefulShutdown = async (signal: string) => {
    console.log(`[Worker] Received ${signal}. Closing workers and database connections...`);
    await auditWorker.close();
    await notificationWorker.close();
    await prisma.$disconnect();
    console.log('[Worker] Graceful shutdown complete. Exiting.');
    process.exit(0);
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  console.error('[Worker] Fatal error bootstrapping worker:', err);
  process.exit(1);
});
