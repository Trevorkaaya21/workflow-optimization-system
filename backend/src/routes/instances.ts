import { Router } from 'express';
import { prisma } from '../prisma.js';
import { mockAuth, AuthedRequest, requireRole } from '../middleware/auth.js';
import { z } from 'zod';
import { enqueueSlaTimer } from '../services/automationService.js';
import { evaluateRulesForStep } from '../services/ruleEngine.js';
import { recordAudit } from '../services/auditService.js';
import type { Task, WorkflowStep } from '@prisma/client';

const router = Router();
router.use(mockAuth);

router.get('/', async (_req, res) => {
  const instances = await prisma.workflowInstance.findMany({
    include: { workflow: true, tasks: true },
  });
  res.json(instances);
});

router.post('/', requireRole(['manager', 'ops', 'finance', 'director']), async (req: AuthedRequest, res) => {
  const schema = z.object({ workflowId: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const workflow = await prisma.workflow.findUnique({
    where: { id: parsed.data.workflowId },
    include: { steps: true },
  });
  if (!workflow) return res.status(404).json({ error: 'Workflow not found' });
  const instance = await prisma.workflowInstance.create({
    data: {
      workflowId: workflow.id,
      status: 'in_progress',
      tasks: {
        create: workflow.steps.map((step: WorkflowStep) => ({
          stepId: step.id,
          status: step.stepOrder === 1 ? 'pending' : 'blocked',
          dueAt: step.slaMinutes ? new Date(Date.now() + step.slaMinutes * 60 * 1000) : null,
        })),
      },
    },
    include: { tasks: true },
  });
  const firstTask = instance.tasks.find((t) => t.status === 'pending');
  if (firstTask) {
    await evaluateRulesForStep(firstTask.stepId, instance.id);
    await enqueueSlaTimer(firstTask);
  }
  await recordAudit({
    instanceId: instance.id,
    actorId: req.user?.id || 'unknown',
    action: 'workflow_instance_started',
    metadata: { workflowId: workflow.id },
  });
  res.status(201).json(instance);
});

router.post('/:id/advance', async (req: AuthedRequest, res) => {
  const schema = z.object({
    taskId: z.string(),
    status: z.enum(['approved', 'rejected', 'completed']),
    notes: z.string().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const task = await prisma.task.update({
    where: { id: parsed.data.taskId },
    data: { status: parsed.data.status, completedAt: new Date() },
  });
  await recordAudit({
    instanceId: req.params.id,
    actorId: req.user?.id || 'unknown',
    action: 'task_updated',
    metadata: { taskId: task.id, status: parsed.data.status, notes: parsed.data.notes },
  });

  const instanceTasks = await prisma.task.findMany({ where: { instanceId: req.params.id } });
  const nextTask = instanceTasks.find((t: Task) => t.status === 'blocked');
  if (nextTask) {
    await prisma.task.update({ where: { id: nextTask.id }, data: { status: 'pending' } });
    await evaluateRulesForStep(nextTask.stepId, req.params.id);
    await enqueueSlaTimer(nextTask);
  } else {
    await prisma.workflowInstance.update({
      where: { id: req.params.id },
      data: { status: 'completed', completedAt: new Date() },
    });
  }

  res.json({ ok: true });
});

export default router;
