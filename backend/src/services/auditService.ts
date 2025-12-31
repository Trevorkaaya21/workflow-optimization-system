import { prisma } from '../prisma.js';
import type { EventAuditLog, Prisma } from '@prisma/client';

export const recordAudit = async (params: {
  instanceId: string | null;
  actorId: string;
  action: string;
  metadata?: Prisma.InputJsonValue | null;
}) => {
  await prisma.eventAuditLog.create({
    data: {
      instanceId: params.instanceId || undefined,
      actorId: params.actorId,
      action: params.action,
      metadata: params.metadata ?? {},
    },
  });
};

export const exportAuditCsv = (rows: EventAuditLog[]) => {
  const header = 'timestamp,instanceId,actorId,action,metadata';
  const lines = rows.map((row) => {
    return [
      row.timestamp.toISOString(),
      row.instanceId,
      row.actorId,
      row.action,
      JSON.stringify(row.metadata || {}),
    ].join(',');
  });
  return [header, ...lines].join('\n');
};
