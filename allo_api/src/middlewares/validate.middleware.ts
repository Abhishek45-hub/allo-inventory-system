import type { NextFunction, Request, Response } from 'express';
import type { AnyZodObject } from 'zod';
import { HttpStatus } from '@/constants/http-status';
import { AppError } from '@/utils/app-error';

export const validate = (schema: AnyZodObject) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!parsed.success) {
      next(new AppError(HttpStatus.BAD_REQUEST, 'Validation failed', parsed.error.flatten()));
      return;
    }

    next();
  };
};
