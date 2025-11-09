import { Request } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { config } from '../config';

const VALID_API_KEYS = new Set(config.VALID_API_KEYS.split(','));
const SUPABASE_JWT_KEYS = createRemoteJWKSet(new URL(config.JWT_DISCOVERY_URL));

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

interface SupabaseJWTPayload {
  sub: string;
  email?: string;
  role?: string;
  app_metadata?: {
    role?: string;
    [key: string]: unknown;
  };
  user_metadata?: {
    [key: string]: never;
  };
  [key: string]: unknown;
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
      throw new Error('Missing or invalid Authorization header');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const verifyResult = await jwtVerify(token, SUPABASE_JWT_KEYS);
      const decoded = verifyResult.payload as SupabaseJWTPayload;

      // Extract user information from JWT payload
      const user: AuthenticatedUser = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role || decoded.app_metadata?.role,
        ...decoded.user_metadata,
      };

      // Optional: Check scopes if required
      if (scopes && scopes.length > 0) {
        const userRole = user.role;

        if (!userRole || !scopes.includes(userRole)) {
          throw new Error('Insufficient permissions');
        }
      }

      return user;
    } catch (error) {
      throw new Error('Invalid or expired token', { cause: error });
    }
  }

  if (securityName === 'ApiKeyAuth') {
    // Extract API key from header (preferred) or query parameter (fallback)
    const apiKey =
      (request.headers['x-api-key'] as string) ||
      (request.headers['X-API-KEY'] as string) ||
      (request.query.apiKey as string);

    if (!apiKey) {
      throw new Error(
        "API key is required. Please provide it in the 'X-API-KEY' header or 'apiKey' query parameter.",
      );
    }

    if (typeof apiKey !== 'string') {
      throw new Error('API key must be a string.');
    }

    if (VALID_API_KEYS.has(apiKey)) {
      return {
        id: apiKey,
        email: `api-key@user.admin`,
      };
    } else {
      throw new Error('Invalid API key. Please check your credentials.');
    }
  }

  throw new Error('Unknown security scheme');
}
