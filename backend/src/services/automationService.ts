import { Queue } from 'bullmq';
import { config } from '../config.js';
import type { Task } from '@prisma/client';
import { redisConnection } from '../jobs/queue.js';
import { recordAudit } from './auditService.js';

export const slaQueueName = 'slaQueue';
export const notificationQueueName = 'notificationQueue';

export const slaQueue = new Queue(slaQueueName, { connection: redisConnection });
export const notificationQueue = new Queue(notificationQueueName, { connection: redisConnection });

export const enqueueSlaTimer = async (task: Task) => {
  if (!task.dueAt) return;
  await slaQueue.add(
    'sla-check',
    { taskId: task.id },
    { delay: Math.max(0, task.dueAt.getTime() - Date.now()) }
  );
};

export const handleSlaBreach = async (payload: { taskId: string }) => {
  await notificationQueue.add('escalate', payload);
  await recordAudit({
    instanceId: null,
    actorId: 'system',
    action: 'sla_breach_detected',
    metadata: payload,
  });
};

export const sendNotification = async (payload: { taskId: string; channel?: 'email' | 'slack' }) => {
  // Hook to plug real providers; for now log + structured event.
  console.log('Sending notification', payload);
  await recordAudit({
    instanceId: null,
    actorId: 'system',
    action: 'notification_sent',
    metadata: payload,
  });
};
