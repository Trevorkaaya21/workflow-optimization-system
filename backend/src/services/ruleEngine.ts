import { prisma } from '../prisma.js';
import { enqueueSlaTimer, notificationQueue } from './automationService.js';

type RuleContext = {
  amount?: number;
  department?: string;
};

const evalCondition = (condition: string, context: RuleContext) => {
  // Minimal condition evaluator for demo rules like "amount > 5000"
  if (condition.includes('amount') && context.amount !== undefined) {
    const match = condition.match(/amount\\s*([><]=?)\\s*(\\d+)/);
    if (!match) return false;
    const [, op, threshold] = match;
    const value = Number(threshold);
    switch (op) {
      case '>':
        return context.amount > value;
      case '>=':
        return context.amount >= value;
      case '<':
        return context.amount < value;
      case '<=':
        return context.amount <= value;
      default:
        return false;
    }
  }
  return false;
};

export const evaluateRulesForStep = async (stepId: string, instanceId: string, context: RuleContext = {}) => {
  const step = await prisma.workflowStep.findUnique({ where: { id: stepId } });
  if (!step) return;
  const rules = await prisma.rule.findMany({ where: { workflowId: step.workflowId }, orderBy: { priority: 'asc' } });

  for (const rule of rules) {
    if (!evalCondition(rule.condition, context)) continue;
    if (rule.action.startsWith('auto-approve')) {
      await prisma.task.updateMany({
        where: { instanceId, stepId },
        data: { status: 'completed', completedAt: new Date() },
      });
    }
    if (rule.action.startsWith('escalate')) {
      await notificationQueue.add('escalate', { stepId, instanceId });
    }
    if (rule.action.startsWith('parallel-approval')) {
      await enqueueParallelApproval(instanceId, stepId);
    }
  }
};

const enqueueParallelApproval = async (instanceId: string, stepId: string) => {
  const step = await prisma.workflowStep.findUnique({ where: { id: stepId } });
  if (!step) return;
  await prisma.task.create({
    data: {
      instanceId,
      stepId,
      status: 'pending',
      dueAt: step.slaMinutes ? new Date(Date.now() + step.slaMinutes * 60 * 1000) : null,
    },
  });
};
