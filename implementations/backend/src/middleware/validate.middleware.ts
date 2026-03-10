import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { errorResponse } from '../lib/response';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const firstError = (result.error as ZodError).errors[0];
      const message = firstError
        ? `${firstError.path.join('.')}: ${firstError.message}`
        : 'Validation failed';
      errorResponse(res, message, 422);
      return;
    }
    req.body = result.data;
    next();
  };
}
