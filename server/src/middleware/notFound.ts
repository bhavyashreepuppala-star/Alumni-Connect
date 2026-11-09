import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../utils/appError';

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found on this server`));
};
