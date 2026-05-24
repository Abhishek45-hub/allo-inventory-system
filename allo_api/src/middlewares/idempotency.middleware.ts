import { createHash } from 'node:crypto';
import { IdempotencyStatus, Prisma } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '@/constants/http-status';
import { redis } from '@/cache/redis';
import { logger } from '@/config/logger';
import { prisma } from '@/database/prisma';
import { AppError } from '@/utils/app-error';

const buildRequestHash = (request: Request): string => {
  const payload = JSON.stringify({ body: request.body, params: request.params, query: request.query });
  return createHash('sha256').update(payload).digest('hex');
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const readCompletedResponse = async (key: string, redisKey: string) => {
  const cached = await redis.get(redisKey).catch((error) => {
    logger.warn({ error }, 'idempotency_cache_read_failed');
    return null;
  });

  if (cached) {
    return JSON.parse(cached) as {
      route: string;
      requestHash: string;
      responseCode: number;
      responseBody: unknown;
    };
  }

  const existing = await prisma.idempotencyKey.findUnique({ where: { key } });
  if (
    existing?.status === IdempotencyStatus.COMPLETED &&
    existing.responseCode &&
    existing.responseBody !== null
  ) {
    return {
      route: existing.route,
      requestHash: existing.requestHash,
      responseCode: existing.responseCode,
      responseBody: existing.responseBody,
    };
  }

  return null;
};

export const idempotencyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const key = req.header('Idempotency-Key');
  if (!key || req.method !== 'POST') {
    next();
    return;
  }

  const route = req.originalUrl;
  const requestHash = buildRequestHash(req);
  const redisKey = `idem:${key}`;

  const completed = await readCompletedResponse(key, redisKey);
  if (completed) {
    if (completed.route !== route || completed.requestHash !== requestHash) {
      next(new AppError(HttpStatus.CONFLICT, 'Idempotency-Key was reused with a different request'));
      return;
    }

    res.status(completed.responseCode).json(completed.responseBody);
    return;
  }

  const existing = await prisma.idempotencyKey.findUnique({ where: { key } });
  if (existing) {
    if (existing.route !== route || existing.requestHash !== requestHash) {
      next(new AppError(HttpStatus.CONFLICT, 'Idempotency-Key was reused with a different request'));
      return;
    }

    for (let attempt = 0; attempt < 40; attempt += 1) {
      await sleep(250);
      const later = await readCompletedResponse(key, redisKey);
      if (later) {
        res.status(later.responseCode).json(later.responseBody);
        return;
      }
    }

    next(new AppError(HttpStatus.CONFLICT, 'Idempotent request is still in progress'));
    return;
  }

  try {
    await prisma.idempotencyKey.create({
      data: {
        key,
        route,
        requestHash,
        status: IdempotencyStatus.IN_PROGRESS,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      for (let attempt = 0; attempt < 40; attempt += 1) {
        await sleep(250);
        const later = await readCompletedResponse(key, redisKey);
        if (later) {
          if (later.route !== route || later.requestHash !== requestHash) {
            next(new AppError(HttpStatus.CONFLICT, 'Idempotency-Key was reused with a different request'));
            return;
          }
          res.status(later.responseCode).json(later.responseBody);
          return;
        }
      }

      next(new AppError(HttpStatus.CONFLICT, 'Idempotent request is still in progress'));
      return;
    }
    next(error);
    return;
  }

  const originalJson = res.json.bind(res);
  res.json = (body: unknown) => {
    const responseCode = res.statusCode || HttpStatus.OK;
    void redis.set(
      redisKey,
      JSON.stringify({ route, requestHash, responseCode, responseBody: body }),
      'EX',
      60 * 60 * 24,
    ).catch((error) => {
      logger.warn({ error }, 'idempotency_cache_write_failed');
    });
    void prisma.idempotencyKey.upsert({
      where: { key },
      update: {
        route,
        requestHash,
        status: IdempotencyStatus.COMPLETED,
        responseCode,
        responseBody: body as object,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      create: {
        key,
        route,
        requestHash,
        status: IdempotencyStatus.COMPLETED,
        responseCode,
        responseBody: body as object,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    }).catch((error) => {
      logger.error({ error }, 'idempotency_persist_failed');
    });
    return originalJson(body);
  };

  next();
};
