import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config.js';
import { handleSlaBreach, sendNotification, slaQueueName, notificationQueueName } from '../services/automationService.js';

export const redisConnection = new IORedis(config.redisUrl);

export const initQueues = async () => {
  new Worker(
    slaQueueName,
    async (job) => {
      await handleSlaBreach(job.data as { taskId: string });
    },
    { connection: redisConnection }
  );

  new Worker(
    notificationQueueName,
    async (job) => {
      await sendNotification(job.data as { taskId: string; channel?: 'email' | 'slack' });
    },
    { connection: redisConnection }
  );
  console.log('Queues initialized');
};
