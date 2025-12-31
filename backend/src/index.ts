import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config.js';
import workflowRouter from './routes/workflows.js';
import instanceRouter from './routes/instances.js';
import analyticsRouter from './routes/analytics.js';
import auditRouter from './routes/audit.js';
import { initQueues } from './jobs/queue.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/workflows', workflowRouter);
app.use('/instances', instanceRouter);
app.use('/analytics', analyticsRouter);
app.use('/audit', auditRouter);

app.listen(config.port, () => {
  console.log(`API listening on port ${config.port}`);
});

initQueues().catch((err) => {
  console.error('Failed to init queues', err);
});
