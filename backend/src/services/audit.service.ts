import { prisma } from '../config';

export interface AuditLogInput {
  userId: string;
  patientId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: any;
}

export const logAudit = async (input: AuditLogInput) => {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: input.userId,
        patientId: input.patientId,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      },
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
    return null;
  }
};
