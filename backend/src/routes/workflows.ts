import { Router } from 'express';
import { prisma } from '../prisma.js';
import { mockAuth, AuthedRequest, requireRole } from '../middleware/auth.js';
import { z } from 'zod';
import { recordAudit } from '../services/auditService.js';

const router = Router();
router.use(mockAuth);

const stepSchema = z.object({
  stepOrder: z.number(),
  type: z.string(),
  roleRequired: z.string(),
  slaMinutes: z.number().optional(),
  config: z.any().optional(),
});

const workflowSchema = z.object({
  name: z.string(),
  status: z.string().optional(),
  steps: z.array(stepSchema),
  rules: z
    .array(
      z.object({
        condition: z.string(),
        action: z.string(),
        priority: z.number().default(1),
      })
    )
    .optional(),
});

router.get('/', async (_req, res) => {
  const workflows = await prisma.workflow.findMany({ include: { steps: true, rules: true } });
  res.json(workflows);
});

router.post('/', requireRole(['manager', 'ops', 'finance', 'director']), async (req: AuthedRequest, res) => {
  const parsed = workflowSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const { name, status = 'draft', steps, rules = [] } = parsed.data;
  const workflow = await prisma.workflow.create({
    data: {
      name,
      status,
      version: 1,
      createdBy: req.user?.id || 'unknown',
      steps: {
        create: steps,
      },
      rules: {
        create: rules,
      },
    },
    include: { steps: true, rules: true },
  });
  await recordAudit({
    instanceId: null,
    actorId: req.user?.id || 'unknown',
    action: 'workflow_created',
    metadata: { workflowId: workflow.id },
  });
  res.status(201).json(workflow);
});

router.post('/:id/publish', requireRole(['manager', 'director']), async (req: AuthedRequest, res) => {
  const { id } = req.params;
  const workflow = await prisma.workflow.update({
    where: { id },
    data: { status: 'active', version: { increment: 1 } },
  });
  await recordAudit({
    instanceId: null,
    actorId: req.user?.id || 'unknown',
    action: 'workflow_published',
    metadata: { workflowId: workflow.id },
  });
  res.json(workflow);
});

router.post('/:id/rules', requireRole(['manager', 'ops', 'director']), async (req, res) => {
  const ruleSchema = z.object({
    condition: z.string(),
    action: z.string(),
    priority: z.number(),
  });
  const parsed = ruleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const rule = await prisma.rule.create({
    data: {
      ...parsed.data,
      workflowId: req.params.id,
    },
  });
  res.status(201).json(rule);
});

export default router;
