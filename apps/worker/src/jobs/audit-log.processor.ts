import { Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';

export async function processAuditLogJob(job: Job, prisma: PrismaClient) {
  const payload = job.data;
  console.log(`[Worker] Processing audit log job ${job.id} for action: ${payload.action}`);

  await prisma.auditLog.create({
    data: {
      userId: payload.userId,
      organizationId: payload.organizationId,
      pluginId: payload.pluginId,
      action: payload.action,
      result: payload.result,
      ipAddress: payload.ipAddress,
      sessionId: payload.sessionId,
      details: payload.details || {},
    },
  });

  await prisma.systemLog.create({
    data: {
      level: 'INFO',
      source: 'AUDIT',
      message: `User ${payload.userId || 'Unknown'} performed ${payload.action} with result ${payload.result} in Org ${payload.organizationId || 'None'}`,
      metadata: {
        pluginId: payload.pluginId,
        ipAddress: payload.ipAddress,
        details: payload.details,
      },
    },
  });
}
