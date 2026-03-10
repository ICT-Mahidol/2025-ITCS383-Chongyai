import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { verifyToken } from '../lib/jwt';
import { errorResponse } from '../lib/response';

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : undefined;

  if (!token) {
    errorResponse(res, 'Authentication token required', 401);
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.id, email: payload.email, role: payload.role };
    next();
  } catch {
    errorResponse(res, 'Invalid or expired token', 401);
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      errorResponse(res, 'Authentication required', 401);
      return;
    }
    if (!roles.includes(req.user.role)) {
      errorResponse(res, 'Insufficient permissions', 403);
      return;
    }
    next();
  };
}

export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : undefined;

  if (token) {
    try {
      const payload = verifyToken(token);
      req.user = { id: payload.id, email: payload.email, role: payload.role };
    } catch {
      // token invalid — proceed without user
    }
  }
  next();
}
