import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { env } from '@/config/env';
import { logger } from '@/config/logger';
import { openapiDocument } from '@/docs/openapi';
import { errorMiddleware } from '@/middlewares/error.middleware';
import { notFoundMiddleware } from '@/middlewares/not-found.middleware';
import { apiRouter } from '@/routes';

export const app = express();
const corsOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim());

app.use(pinoHttp({ logger }));
app.use(helmet());
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));
app.use(env.API_PREFIX, apiRouter);
app.use(notFoundMiddleware);
app.use(errorMiddleware);
