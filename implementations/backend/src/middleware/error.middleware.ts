import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

interface AppError extends Error {
  statusCode?: number;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({ success: false, error: 'Resource already exists' });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ success: false, error: 'Resource not found' });
      return;
    }
  }

  const statusCode = err.statusCode ?? 500;
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error'
      : err.message;

  res.status(statusCode).json({ success: false, error: message });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ success: false, error: 'Route not found' });
}
