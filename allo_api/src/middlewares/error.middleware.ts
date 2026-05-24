import type { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '@/constants/http-status';
import { logger } from '@/config/logger';
import { AppError } from '@/utils/app-error';

const isPrismaConnectionError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const code = 'code' in error && typeof error.code === 'string' ? error.code : undefined;
  return code === 'P1000' || code === 'P1001' || code === 'P1017';
};

export const errorMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const statusCode = error instanceof AppError
    ? error.statusCode
    : isPrismaConnectionError(error)
      ? HttpStatus.SERVICE_UNAVAILABLE
      : HttpStatus.INTERNAL_SERVER_ERROR;
  const message = error instanceof AppError
    ? error.message
    : isPrismaConnectionError(error)
      ? 'Database unavailable. Verify DATABASE_URL credentials and DB service status.'
      : 'Unexpected server error';
  const details = error instanceof AppError ? error.details : undefined;

  logger.error({ error }, 'request_failed');
  res.status(statusCode).json({ success: false, message, details });
};
