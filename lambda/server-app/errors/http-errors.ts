/**
 * Options for creating an HttpError
 */
export interface HttpErrorOptions {
  cause?: Error | unknown;
  isOperational?: boolean;
}

/**
 * Base HTTP Error class that extends the native Error
 * All HTTP errors should extend this class
 */
export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly cause: Error | unknown;

  constructor(message: string, statusCode: number, options?: HttpErrorOptions) {
    super(message, { cause: options?.cause });
    this.statusCode = statusCode;
    this.isOperational = options?.isOperational ?? true;
    this.cause = options?.cause;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);

    // Set the prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

/**
 * 400 Bad Request
 * The server cannot process the request due to client error
 */
export class BadRequestError extends HttpError {
  constructor(message = 'Bad Request', options?: HttpErrorOptions) {
    super(message, 400, options);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

/**
 * 401 Unauthorized
 * Authentication is required and has failed or has not been provided
 */
export class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized', options?: HttpErrorOptions) {
    super(message, 401, options);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * 403 Forbidden
 * The server understood the request but refuses to authorize it
 */
export class ForbiddenError extends HttpError {
  constructor(message = 'Forbidden', options?: HttpErrorOptions) {
    super(message, 403, options);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * 404 Not Found
 * The requested resource could not be found
 */
export class NotFoundError extends HttpError {
  constructor(message = 'Not Found', options?: HttpErrorOptions) {
    super(message, 404, options);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * 422 Unprocessable Entity
 * The request was well-formed but contains semantic errors
 */
export class UnprocessableEntityError extends HttpError {
  constructor(message = 'Unprocessable Entity', options?: HttpErrorOptions) {
    super(message, 422, options);
    Object.setPrototypeOf(this, UnprocessableEntityError.prototype);
  }
}

/**
 * 429 Too Many Requests
 * The user has sent too many requests in a given amount of time
 */
export class TooManyRequestsError extends HttpError {
  constructor(message = 'Too Many Requests', options?: HttpErrorOptions) {
    super(message, 429, options);
    Object.setPrototypeOf(this, TooManyRequestsError.prototype);
  }
}

/**
 * 500 Internal Server Error
 * A generic error occurred on the server
 */
export class InternalServerError extends HttpError {
  constructor(message = 'Internal Server Error', options?: HttpErrorOptions) {
    super(message, 500, { isOperational: false, ...options });
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}

/**
 * 502 Bad Gateway
 * The server received an invalid response from an upstream server
 */
export class BadGatewayError extends HttpError {
  constructor(message = 'Bad Gateway', options?: HttpErrorOptions) {
    super(message, 502, { isOperational: false, ...options });
    Object.setPrototypeOf(this, BadGatewayError.prototype);
  }
}

/**
 * 503 Service Unavailable
 * The server is not ready to handle the request
 */
export class ServiceUnavailableError extends HttpError {
  constructor(message = 'Service Unavailable', options?: HttpErrorOptions) {
    super(message, 503, { isOperational: false, ...options });
    Object.setPrototypeOf(this, ServiceUnavailableError.prototype);
  }
}

/**
 * 504 Gateway Timeout
 * The server did not receive a timely response from an upstream server
 */
export class GatewayTimeoutError extends HttpError {
  constructor(message = 'Gateway Timeout', options?: HttpErrorOptions) {
    super(message, 504, { isOperational: false, ...options });
    Object.setPrototypeOf(this, GatewayTimeoutError.prototype);
  }
}
