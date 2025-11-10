import { Request } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { config } from '../config';
import {
  HttpError,
  UnauthorizedError,
  ForbiddenError,
  BadRequestError,
} from '../errors/http-errors';

const VALID_API_KEYS = new Set(config.VALID_API_KEYS.split(','));
const JWT_KEYS = createRemoteJWKSet(
  new URL(config.JWT_KEYS_ISSUER + '.well-known/jwks.json'),
);

const roles = {
  ADMINS: 'Admins',
};

export interface AuthenticatedUser {
  id: string;
  roles: string[];
}

interface JWTPayload {
  sub: string;
  'https://api.locals.kovalchuk.work/roles': string[] | undefined;
}

/**
 * TSOA authentication function
 * This is called automatically when using @Security decorator in controllers
 */
export async function expressAuthentication(
  request: Request,
  securityName: string,
  scopes?: string[],
): Promise<AuthenticatedUser> {
  if (securityName === 'JWTAuth') {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid Authorization header');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const verifyResult = await jwtVerify<JWTPayload>(token, JWT_KEYS, {
        issuer: config.JWT_KEYS_ISSUER,
        audience: config.JWT_KEYS_AUDIENCE,
      });
      const decoded = verifyResult.payload;

      // Extract user information from JWT payload
      const user = {
        id: decoded.sub,
        roles: decoded['https://api.locals.kovalchuk.work/roles'] || [],
      };

      if (!user.roles.includes(roles.ADMINS)) {
        throw new ForbiddenError('Admin role required');
      }

      return user;
    } catch (error) {
      // Re-throw HTTP errors as-is
      if (error instanceof HttpError) {
        throw error;
      }
      // Wrap JWT verification errors as Unauthorized with cause
      throw new UnauthorizedError(`Invalid or expired token`, { cause: error });
    }
  }

  if (securityName === 'ApiKeyAuth') {
    // Extract API key from header (preferred) or query parameter (fallback)
    const apiKey =
      (request.headers['x-api-key'] as string) ||
      (request.headers['X-API-KEY'] as string) ||
      (request.query.apiKey as string);

    if (!apiKey) {
      throw new UnauthorizedError(
        "API key is required. Please provide it in the 'X-API-KEY' header or 'apiKey' query parameter.",
      );
    }

    if (typeof apiKey !== 'string') {
      throw new BadRequestError('API key must be a string.');
    }

    if (VALID_API_KEYS.has(apiKey)) {
      return {
        id: `api-key|${apiKey}`,
        roles: [roles.ADMINS],
      };
    }

    throw new UnauthorizedError('Invalid API key.');
  }

  throw new BadRequestError('Unknown security scheme');
}
