import type { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '@/constants/http-status';
import { JwtProvider } from '@/providers/jwt.provider';
import { AppError } from '@/utils/app-error';

const jwtProvider = new JwtProvider();

export const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(new AppError(HttpStatus.UNAUTHORIZED, 'Missing bearer token'));
    return;
  }

  try {
    const token = header.slice('Bearer '.length);
    const payload = jwtProvider.verifyAccess(token);
    req.auth = {
      userId: payload.sub,
      role: payload.role,
      tokenVersion: payload.tokenVersion,
    };
    next();
  } catch {
    next(new AppError(HttpStatus.UNAUTHORIZED, 'Invalid access token'));
  }
};
