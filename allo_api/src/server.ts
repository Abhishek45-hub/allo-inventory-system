import { app } from '@/app';
import { redis } from '@/cache/redis';
import { env } from '@/config/env';
import { logger } from '@/config/logger';
import { prisma } from '@/database/prisma';
import { startReservationExpiryJob } from '@/jobs/reservation-expiry.job';

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, 'api_started');
});

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    logger.error({ port: env.PORT }, 'port_in_use');
    process.exit(1);
  }

  logger.error({ error }, 'server_start_failed');
  process.exit(1);
});

const startDependencies = async () => {
  try {
    await prisma.$connect();
    logger.info('database_connected');
    startReservationExpiryJob();
  } catch (error) {
    const err = error as Error;
    logger.error({ message: err.message, stack: err.stack }, 'database_connect_failed');
    logger.warn({ reason: err.message }, 'reservation_expiry_job_not_started');
  }

  try {
    await redis.connect();
    logger.info('redis_connected');
  } catch (error) {
    const err = error as Error;
    logger.warn({ message: err.message }, 'redis_unavailable_using_database_idempotency_fallback');
  }
};

void startDependencies();

const shutdown = async () => {
  logger.info('shutdown_started');
  server.close(async () => {
    if (redis.status === 'ready') {
      await redis.quit();
    } else {
      redis.disconnect();
    }
    await prisma.$disconnect();
    logger.info('shutdown_complete');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
