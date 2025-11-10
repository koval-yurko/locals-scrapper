import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../errors/http-errors';

/**
 * Error response interface
 */
interface ErrorResponse {
  error: {
    message: string;
    statusCode: number;
  };
}

/**
 * Global error handling middleware for Express
 * This should be the last middleware in the chain
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  // Default to 500 Internal Server Error
  let statusCode = 500;
  let message = 'Internal Server Error';
  let isOperational = false;
  let cause = null;

  // Handle HttpError instances
  if (err instanceof HttpError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
    cause = err.cause;
  } else if (err.message) {
    // For other errors, use their message but keep 500 status
    message = err.message;
  }

  const causeMessage = cause instanceof Error ? cause.message : String(cause);

  // Log non-operational errors (unexpected server errors)
  if (!isOperational || statusCode >= 500) {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      cause: cause ? causeMessage : undefined,
      causeStack: cause instanceof Error ? cause.stack : undefined,
      statusCode,
      path: req.path,
      method: req.method,
    });
  }

  // Construct error response
  const errorResponse: ErrorResponse = {
    error: {
      message,
      statusCode,
    },
  };

  // Send error response
  res.status(statusCode).json(errorResponse);
}
