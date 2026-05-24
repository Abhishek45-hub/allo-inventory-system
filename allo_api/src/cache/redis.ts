import Redis from 'ioredis';
import { env } from '@/config/env';
import { logger } from '@/config/logger';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  lazyConnect: true,
  retryStrategy: () => null,
});

// Log Redis errors so startup shows a helpful message instead of an empty object.
redis.on('error', (error) => {
  logger.warn({ error: error?.message ?? error }, 'redis_error_event');
});
