import { prisma } from './prisma.js';

const run = async () => {
  await prisma.eventAuditLog.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.workflowStep.deleteMany({});
  await prisma.rule.deleteMany({});
  await prisma.workflowInstance.deleteMany({});
  await prisma.workflow.deleteMany({});
  const onboarding = await prisma.workflow.create({
    data: {
      name: 'Employee Onboarding',
      version: 1,
      status: 'active',
      createdBy: 'system',
      steps: {
        create: [
          { stepOrder: 1, type: 'Submit', roleRequired: 'manager', slaMinutes: 60 },
          { stepOrder: 2, type: 'Review', roleRequired: 'ops', slaMinutes: 240 },
          { stepOrder: 3, type: 'Approve', roleRequired: 'director', slaMinutes: 480 },
          { stepOrder: 4, type: 'Execute', roleRequired: 'ops', slaMinutes: 720 },
        ],
      },
      rules: {
        create: [
          { condition: 'amount > 5000', action: 'escalate_director', priority: 1 },
          { condition: 'amount < 500', action: 'auto-approve', priority: 2 },
        ],
      },
    },
    include: { steps: true },
  });

  await prisma.workflowInstance.create({
    data: {
      workflowId: onboarding.id,
      status: 'completed',
      startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      completedAt: new Date(),
      tasks: {
        create: [
          {
            stepId: onboarding.steps[0]?.id || '',
            status: 'completed',
            dueAt: new Date(),
            completedAt: new Date(Date.now() - 1000 * 60 * 60 * 10),
          },
        ],
      },
    },
  });

  console.log('Seed complete');
};

run()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
