import { Router } from 'express';
import { mockAuth } from '../middleware/auth.js';
import { getAnalyticsSummary, getBottlenecks, getSlaBreachRate } from '../services/analyticsService.js';

const router = Router();
router.use(mockAuth);

router.get('/summary', async (_req, res) => {
  const data = await getAnalyticsSummary();
  res.json(data);
});

router.get('/bottlenecks', async (_req, res) => {
  const data = await getBottlenecks();
  res.json(data);
});

router.get('/sla-breach-rate', async (_req, res) => {
  const data = await getSlaBreachRate();
  res.json(data);
});

export default router;
