import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../config/database';
import { UnauthorizedError, ForbiddenError } from '../utils/appError';
import { UserRole, AccountStatus } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  role: UserRole;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        fullName?: string | null;
        role: UserRole;
        status: AccountStatus;
        isEmailVerified: boolean;
        isActive: boolean;
      };
    }
  }
}

/**
 * Authenticates requests via Bearer JWT token in Authorization header.
 */
export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token is required');
    }

    const token = authHeader.split(' ')[1];
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch {
      throw new UnauthorizedError('Invalid or expired authentication token');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        isEmailVerified: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User account not found or deactivated');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Enforces role-based authorization check.
 */
export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to access this resource'));
    }
    next();
  };
};

/**
 * Enforces institutional verification state gate.
 * Unverified, pending, rejected, or suspended accounts are barred from accessing protected features.
 */
export const requireVerified = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }

  if (req.user.status === AccountStatus.PENDING_VERIFICATION) {
    return next(
      new ForbiddenError(
        'Your account is pending institutional verification by college administration / CDC. Access to networking features is restricted until verified.'
      )
    );
  }

  if (req.user.status === AccountStatus.REJECTED) {
    return next(
      new ForbiddenError(
        'Your institutional verification was rejected. Please contact the administration or submit an appeal.'
      )
    );
  }

  if (req.user.status === AccountStatus.SUSPENDED) {
    return next(
      new ForbiddenError('Your account has been suspended by administration.')
    );
  }

  if (req.user.status !== AccountStatus.VERIFIED) {
    return next(new ForbiddenError('Account is not verified.'));
  }

  next();
};

