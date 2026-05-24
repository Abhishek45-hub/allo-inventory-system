import type { UserRole } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '@/constants/http-status';
import { AppError } from '@/utils/app-error';

export const rbacMiddleware = (roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      next(new AppError(HttpStatus.FORBIDDEN, 'Insufficient permissions'));
      return;
    }
    next();
  };
};
