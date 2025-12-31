import { prisma } from '../prisma.js';

export const getAnalyticsSummary = async () => {
  const totalInstances = await prisma.workflowInstance.count();
  const completed = await prisma.workflowInstance.count({ where: { status: 'completed' } });
  const slaBreaches = await prisma.task.count({
    where: { dueAt: { lt: new Date() }, status: { not: 'completed' } },
  });

  const cycleTimes = await prisma.$queryRawUnsafe<{ workflowid: string; avg: number }[]>(
    `SELECT "workflowId", AVG(EXTRACT(EPOCH FROM ("completedAt" - "startedAt"))) as avg FROM "WorkflowInstance" WHERE "completedAt" IS NOT NULL GROUP BY "workflowId"`
  );

  return {
    totals: { totalInstances, completed },
    slaBreaches,
    avgCycleTimeByWorkflow: cycleTimes.map((row: { workflowid: string; avg: number }) => ({
      workflowId: row.workflowid,
      avgSeconds: Number(row.avg) || 0,
    })),
  };
};

export const getBottlenecks = async () => {
  const bottlenecks = await prisma.$queryRawUnsafe<{ stepId: string; avg_queue: number; count: number }[]>(
    `SELECT t."stepId" as "stepId", AVG(EXTRACT(EPOCH FROM (t."completedAt" - t."createdAt"))) as avg_queue, COUNT(*)::int FROM "Task" t WHERE t."completedAt" IS NOT NULL GROUP BY t."stepId" ORDER BY avg_queue DESC LIMIT 5`
  );

  const steps = await prisma.workflowStep.findMany({
    where: { id: { in: bottlenecks.map((b) => b.stepId) } },
  });

  return bottlenecks.map((b: { stepId: string; avg_queue: number; count: number }) => {
    const step = steps.find((s) => s.id === b.stepId);
    return {
      stepId: b.stepId,
      name: step?.type || 'unknown',
      avgSeconds: Number(b.avg_queue) || 0,
      instances: b.count,
      recommendation:
        (Number(b.avg_queue) || 0) > 3600
          ? 'Split or parallelize approvals; consider auto-approve under threshold.'
          : 'Monitor; keep SLA alerts enabled.',
    };
  });
};

export const getSlaBreachRate = async () => {
  const total = await prisma.task.count();
  if (!total) return { rate: 0, total };
  const breached = await prisma.task.count({
    where: { dueAt: { lt: new Date() }, status: { not: 'completed' } },
  });
  return { rate: breached / total, total };
};
