import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/appError';
import { env } from '../config/env';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  // 1. Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
      timestamp: new Date().toISOString(),
    });
  }

  // 2. Custom App Operational Errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
      timestamp: new Date().toISOString(),
    });
  }

  // 3. Prisma Known Request Errors
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const prismaError = err as { code: string; meta?: Record<string, unknown>; message?: string };
    if (prismaError.code === 'P2002') {
      const target = (prismaError.meta?.target as string[])?.join(', ') || 'field';
      return res.status(409).json({
        success: false,
        message: `A record with this ${target} already exists.`,
        code: 'UNIQUE_CONSTRAINT_VIOLATION',
        timestamp: new Date().toISOString(),
      });
    }

    if (prismaError.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'The requested record was not found in the database.',
        code: 'RECORD_NOT_FOUND',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // 4. Fallback Unhandled Server Errors
  console.error('Unhandled Error:', err);
  const message = err instanceof Error ? err.message : 'Internal Server Error';

  return res.status(500).json({
    success: false,
    message: env.NODE_ENV === 'production' ? 'An unexpected error occurred' : message,
    stack: env.NODE_ENV === 'development' && err instanceof Error ? err.stack : undefined,
    timestamp: new Date().toISOString(),
  });
};
