import { Request, Response } from 'express';
import { prisma } from '../config';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import { Role } from '../types';

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const currentUser = req.user!;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (currentUser.role === Role.PATIENT && currentUser.patientId) {
      where.patientId = currentUser.patientId;
    }

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: { name: true, email: true, role: true },
          },
        },
        orderBy: { timestamp: 'desc' },
      }),
    ]);

    return paginatedResponse(res, logs, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    return errorResponse(res, 'Failed to fetch audit logs', 500);
  }
};
