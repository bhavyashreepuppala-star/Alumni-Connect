import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ApiResponse } from '../utils/apiResponse';
import { BadRequestError } from '../utils/appError';
import { prisma } from '../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

const registerSchema = z.object({
  email: z.string().email('Please provide a valid institutional email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  role: z.enum(['STUDENT', 'ALUMNI', 'ADMIN']),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  rollNumber: z.string().optional(),
  department: z.string().min(1, 'Department is required'),
  graduationYear: z.coerce.number().int().min(1950).max(2035).optional(),
  currentCompany: z.string().optional(),
  currentDesignation: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Please provide a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = registerSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: parsed.email },
      });

      if (existingUser) {
        throw new BadRequestError('An account with this email address already exists');
      }

      const passwordHash = await bcrypt.hash(parsed.password, 10);

      // Create user and profile in transaction
      const newUser = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: parsed.email,
            passwordHash,
            role: parsed.role,
            isEmailVerified: false,
          },
        });

        if (parsed.role === 'STUDENT') {
          await tx.studentProfile.create({
            data: {
              userId: user.id,
              rollNumber: parsed.rollNumber || `CS-${Date.now().toString().slice(-4)}`,
              department: parsed.department,
              expectedGraduationYear: parsed.graduationYear || new Date().getFullYear() + 2,
            },
          });
        } else if (parsed.role === 'ALUMNI') {
          await tx.alumniProfile.create({
            data: {
              userId: user.id,
              graduationYear: parsed.graduationYear || 2020,
              department: parsed.department,
              currentCompany: parsed.currentCompany,
              currentDesignation: parsed.currentDesignation,
              isVerified: false,
            },
          });
        } else if (parsed.role === 'ADMIN') {
          await tx.adminProfile.create({
            data: {
              userId: user.id,
              employeeId: `ADM-${Date.now().toString().slice(-4)}`,
              department: parsed.department,
              designation: 'Campus Coordinator',
            },
          });
        }

        return user;
      });

      const token = jwt.sign(
        { userId: newUser.id, role: newUser.role, email: newUser.email },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN }
      );

      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'Account registered successfully. Welcome to Alumni Connect!',
        data: {
          token,
          user: {
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
            isEmailVerified: newUser.isEmailVerified,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = loginSchema.parse(req.body);

      const user = await prisma.user.findUnique({
        where: { email: parsed.email },
        include: {
          studentProfile: true,
          alumniProfile: true,
          adminProfile: true,
        },
      });

      if (!user) {
        throw new BadRequestError('Invalid email or password credentials');
      }

      const isMatch = await bcrypt.compare(parsed.password, user.passwordHash);
      if (!isMatch) {
        throw new BadRequestError('Invalid email or password credentials');
      }

      const token = jwt.sign(
        { userId: user.id, role: user.role, email: user.email },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN }
      );

      return ApiResponse.success(res, {
        message: 'Authentication successful',
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            profile:
              user.role === 'STUDENT'
                ? user.studentProfile
                : user.role === 'ALUMNI'
                ? user.alumniProfile
                : user.adminProfile,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getDemoAccounts(req: Request, res: Response) {
    return ApiResponse.success(res, {
      message: 'Demo accounts for development and testing',
      data: [
        {
          role: 'ADMIN',
          email: 'admin@alumniconnect.edu',
          password: 'Password123!',
          description: 'Institutional Admin with access to pending alumni verifications and audit logs',
        },
        {
          role: 'ALUMNI',
          email: 'sarah.chen@alumni.edu',
          password: 'Password123!',
          description: 'Verified Alumni (Staff SWE at Google) offering mentorship to students',
        },
        {
          role: 'STUDENT',
          email: 'alex.rivera@student.edu',
          password: 'Password123!',
          description: 'Current 3rd-year CS student looking for summer internship mentorship',
        },
      ],
    });
  }
}
