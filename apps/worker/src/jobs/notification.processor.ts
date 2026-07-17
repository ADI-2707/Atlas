import { Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';

export async function processNotificationJob(job: Job, prisma: PrismaClient) {
  const payload = job.data;
  console.log(`[Worker] Processing notification job ${job.id} for user: ${payload.userId}`);

  // 1. Create notification in database
  await prisma.notification.create({
    data: {
      userId: payload.userId,
      title: payload.title,
      message: payload.message,
      type: payload.type || 'INFO',
      actionUrl: payload.actionUrl,
    },
  });

  // 2. Mock Email / External Dispatch channel output
  console.log(`[Worker Email Dispatch Output]`);
  console.log(`  To User: ${payload.userId}`);
  console.log(`  Title:   ${payload.title}`);
  console.log(`  Content: ${payload.message}`);
}
