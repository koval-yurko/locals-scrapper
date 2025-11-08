import express, {
  json,
  urlencoded,
  Request,
  Response,
  NextFunction,
} from 'express';
import cors from 'cors';
import { config } from './config';
import { RegisterRoutes } from './openapi/routes';

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
app.get(`${config.BASE_URL}`, (_req, res) => {
  res.sendFile('./swagger.json', { root: `${__dirname}/openapi` });
});

// Health check endpoint at root
app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'LocalsScrapper API' });
});

// 404 handler for unmatched routes
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});
