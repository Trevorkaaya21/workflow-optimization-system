import { Router } from 'express';
import { mockAuth } from '../middleware/auth.js';
import { prisma } from '../prisma.js';
import { exportAuditCsv } from '../services/auditService.js';

const router = Router();
router.use(mockAuth);

router.get('/', async (_req, res) => {
  const logs = await prisma.eventAuditLog.findMany({
    orderBy: { timestamp: 'desc' },
  });
  res.json(logs);
});

router.get('/export', async (_req, res) => {
  const logs = await prisma.eventAuditLog.findMany({ orderBy: { timestamp: 'desc' } });
  const csv = exportAuditCsv(logs);
  res.setHeader('Content-Type', 'text/csv');
  res.send(csv);
});

export default router;
