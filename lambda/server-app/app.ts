import express, {
  json,
  urlencoded,
  NextFunction,
  Request,
  Response,
} from 'express';
import cors from 'cors';
import { config } from './config';
import { RegisterRoutes } from './openapi/routes';
import { errorHandler } from './middleware/error-handler';
import { NotFoundError } from './errors/http-errors';

export const app = express();

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'X-Amz-Date',
      'Authorization',
      'X-Api-Key',
    ],
    credentials: false,
  }),
);

app.use(
  urlencoded({
    extended: true,
  }),
);
app.use(json());

RegisterRoutes(app);

// Serve swagger.json at /api
app.get(`${config.BASE_URL}/swagger.json`, (_req, res) => {
  res.sendFile('./swagger.json', { root: `${__dirname}/openapi` });
});

// Health check endpoint at root
app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'LocalsScrapper API' });
});

// 404 handler for unmatched routes
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError('Route not found'));
});

// Error handler - must be the last middleware
app.use(errorHandler);
