import Redis from 'ioredis';
import { env } from '@/config/env';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  lazyConnect: true,
  retryStrategy: () => null,
});

// Prevent noisy unhandled error events when Redis is optional in local development.
redis.on('error', () => {});
