import Redis from 'ioredis';
import { env } from '@/config/env';
import { logger } from '@/config/logger';

type RedisLike = Pick<Redis, 'status' | 'connect' | 'quit' | 'disconnect' | 'get' | 'set'>;

const createNoopRedisClient = (): RedisLike => ({
  status: 'end',
  connect: async () => {
    logger.info('redis_disabled_no_url_configured');
  },
  quit: async () => 'OK',
  disconnect: () => {},
  get: async () => null,
  set: async () => null,
}) as unknown as RedisLike;

const createRedisClient = (): RedisLike => {
  if (!env.REDIS_URL) {
    return createNoopRedisClient();
  }

  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    lazyConnect: true,
    retryStrategy: () => null,
  });

  client.on('error', (error) => {
    logger.warn({ error: error?.message ?? error }, 'redis_error_event');
  });

  return client;
};

export const redis = createRedisClient();
