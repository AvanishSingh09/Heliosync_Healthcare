import { Request, Response, NextFunction } from 'express';
import { Role } from '../types';
import { errorResponse } from '../utils/response';

export const requireRole = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied. Required role: ${allowedRoles.join(', ')}`,
        403
      );
    }

    next();
  };
};
