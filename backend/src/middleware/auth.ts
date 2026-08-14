import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { prisma } from '../config';
import { errorResponse } from '../utils/response';
import { Role } from '../types';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  patientId?: string;
  doctorId?: string;
  hospitalId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authorization token missing or invalid format', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded: JwtPayload = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        patient: true,
        doctor: {
          include: {
            hospital: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      return errorResponse(res, 'User account not found or deactivated', 401);
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as Role,
      patientId: user.patient?.id,
      doctorId: user.doctor?.id,
      hospitalId: user.doctor?.hospitalId,
    };

    next();
  } catch (error: any) {
    return errorResponse(res, 'Invalid or expired authentication token', 401);
  }
};
