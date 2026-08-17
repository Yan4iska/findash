import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { resolveCorsOrigin } from './config/cors.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './routes/authRoutes.js';
import { categoryRouter } from './routes/categoryRoutes.js';
import { transactionRouter } from './routes/transactionRoutes.js';
import { analyticsRouter } from './routes/analyticsRoutes.js';
import { dashboardRouter } from './routes/dashboardRoutes.js';
import { forecastRouter } from './routes/forecastRoutes.js';
import { openApiSpec } from './openapi/spec.js';

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: resolveCorsOrigin(),
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

  app.use('/auth', authRouter);
  app.use('/categories', categoryRouter);
  app.use('/transactions', transactionRouter);
  app.use('/analytics', analyticsRouter);
  app.use('/dashboard', dashboardRouter);
  app.use('/forecast', forecastRouter);

  app.use(errorHandler);

  return app;
}
