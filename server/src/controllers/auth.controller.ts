import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ApiResponse } from '../utils/apiResponse';
import { BadRequestError, ConflictError, ForbiddenError, UnauthorizedError } from '../utils/appError';
import { prisma } from '../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserRole, AccountStatus, VerificationStatus, StudentVerificationMethod } from '@prisma/client';

// Password complexity rules: at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=[\]{}|;:'",.<>/`~])[A-Za-z\d@$!%*?&#^()_+\-=[\]{}|;:'",.<>/`~]{8,}$/;

// Institutional Student Registration Schema
export const studentRegisterSchema = z
  .object({
    fullName: z
      .string({ required_error: 'Full name is required' })
      .trim()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name cannot exceed 100 characters'),
    email: z
      .string({ required_error: 'Institutional email is required' })
      .trim()
      .email('Please provide a valid institutional email address')
      .toLowerCase(),
    rollNumber: z
      .string({ required_error: 'USN / Student registration number is required' })
      .trim()
      .min(3, 'USN / roll number must be at least 3 characters')
      .max(40, 'USN / roll number cannot exceed 40 characters')
      .regex(/^[A-Za-z0-9\-_./]+$/, 'USN must contain valid alphanumeric characters and symbols (- _ . /)')
      .transform((val) => val.toUpperCase()),
    department: z
      .string({ required_error: 'Department is required' })
      .trim()
      .min(2, 'Department is required')
      .max(100, 'Department name cannot exceed 100 characters'),
    degree: z
      .string({ required_error: 'Degree / Program is required' })
      .trim()
      .min(2, 'Degree/program is required')
      .max(100, 'Degree name cannot exceed 100 characters')
      .default('B.Tech'),
    currentSemester: z.coerce
      .number({ required_error: 'Current semester is required' })
      .int('Semester must be an integer')
      .min(1, 'Current semester must be between 1 and 12')
      .max(12, 'Current semester must be between 1 and 12'),
    expectedGraduationYear: z.coerce
      .number({ required_error: 'Expected graduation year is required' })
      .int('Graduation year must be an integer')
      .min(2024, 'Expected graduation year must be 2024 or later')
      .max(2035, 'Expected graduation year cannot exceed 2035'),
    phoneNumber: z
      .string()
      .trim()
      .optional()
      .or(z.literal(''))
      .refine(
        (val) => !val || /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/.test(val),
        'Please enter a valid phone number format'
      ),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters long')
      .regex(
        passwordRegex,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    confirmPassword: z.string({ required_error: 'Please confirm your password' }).min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password confirmation does not match the password',
    path: ['confirmPassword'],
  });

// Generic Registration Schema (Backward Compatibility)
const legacyRegisterSchema = z.object({
  email: z.string().email('Please provide a valid institutional email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  role: z.enum(['STUDENT', 'ALUMNI', 'ADMIN']).default('STUDENT'),
  fullName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  rollNumber: z.string().optional(),
  department: z.string().optional().default('Computer Science and Engineering'),
  degree: z.string().optional().default('B.Tech'),
  currentSemester: z.coerce.number().optional().default(6),
  graduationYear: z.coerce.number().int().min(1950).max(2035).optional(),
  phoneNumber: z.string().optional(),
  currentCompany: z.string().optional(),
  currentDesignation: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Please provide a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export class AuthController {
  /**
   * Dedicated Student Registration Endpoint (POST /api/auth/register/student)
   * Strictly enforces institutional registration, backend validation, duplicate checks,
   * bcrypt password hashing, and atomic transaction.
   */
  static async registerStudent(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const parsed = studentRegisterSchema.parse(req.body);

      const normalizedEmail = parsed.email.trim().toLowerCase();
      const normalizedUSN = parsed.rollNumber.trim().toUpperCase();

      // Configurable Institutional Email Domain verification (if configured in environment)
      if (env.INSTITUTION_EMAIL_DOMAINS && env.INSTITUTION_EMAIL_DOMAINS.trim().length > 0) {
        const allowedDomains = env.INSTITUTION_EMAIL_DOMAINS
          .split(',')
          .map((d) => d.trim().toLowerCase())
          .filter(Boolean);

        const emailDomain = normalizedEmail.split('@')[1];
        if (allowedDomains.length > 0 && (!emailDomain || !allowedDomains.includes(emailDomain))) {
          throw new BadRequestError(
            `Email domain '@${emailDomain}' is not an authorized institutional domain for this platform.`
          );
        }
      }

      // Check for duplicate institutional email
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUserByEmail) {
        throw new ConflictError('An account with this institutional email address already exists');
      }

      // Check for duplicate USN / student registration number
      const existingStudentByUSN = await prisma.studentProfile.findUnique({
        where: { rollNumber: normalizedUSN },
      });

      if (existingStudentByUSN) {
        throw new ConflictError('A student profile with this USN / registration number already exists');
      }

      // Hash password using bcrypt with standard work factor 10
      const passwordHash = await bcrypt.hash(parsed.password, 10);

      // Create User, StudentProfile, and StudentVerification records inside an atomic Prisma transaction
      const { newUser, newProfile, newVerification } = await prisma.$transaction(async (tx) => {
        // 1. Create base user account with server-controlled role and PENDING_VERIFICATION status
        const user = await tx.user.create({
          data: {
            email: normalizedEmail,
            passwordHash,
            role: UserRole.STUDENT, // Strictly assigned on server
            status: AccountStatus.PENDING_VERIFICATION, // Gated pending verification
            fullName: parsed.fullName.trim(),
            phoneNumber: parsed.phoneNumber && parsed.phoneNumber.trim().length > 0 ? parsed.phoneNumber.trim() : null,
            isEmailVerified: false,
            isActive: true,
          },
        });

        // 2. Create student profile with unverified flag
        const profile = await tx.studentProfile.create({
          data: {
            userId: user.id,
            rollNumber: normalizedUSN,
            department: parsed.department.trim(),
            degree: parsed.degree ? parsed.degree.trim() : 'B.Tech',
            currentSemester: parsed.currentSemester,
            expectedGraduationYear: parsed.expectedGraduationYear,
            isVerified: false, // Strictly unverified upon registration
          },
        });

        // 3. Queue verification request in StudentVerification audit table
        const verification = await tx.studentVerification.create({
          data: {
            studentProfileId: profile.id,
            usnClaimed: normalizedUSN,
            status: VerificationStatus.PENDING,
            verificationMethod: StudentVerificationMethod.REGISTRAR_DATABASE_MATCH,
            submissionNotes: 'Self-registered student account awaiting institutional credential review.',
          },
        });

        return { newUser: user, newProfile: profile, newVerification: verification };
      });

      // Never return password hashes or sensitive internal secrets
      return ApiResponse.success(res, {
        statusCode: 201,
        message:
          'Student registration submitted successfully. Your account is pending verification by college administration / CDC.',
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            fullName: newUser.fullName,
            phoneNumber: newUser.phoneNumber,
            role: newUser.role,
            status: newUser.status,
            isEmailVerified: newUser.isEmailVerified,
            createdAt: newUser.createdAt,
          },
          profile: {
            id: newProfile.id,
            rollNumber: newProfile.rollNumber,
            department: newProfile.department,
            degree: newProfile.degree,
            currentSemester: newProfile.currentSemester,
            expectedGraduationYear: newProfile.expectedGraduationYear,
            isVerified: newProfile.isVerified,
          },
          verification: {
            id: newVerification.id,
            status: newVerification.status,
            verificationMethod: newVerification.verificationMethod,
            usnClaimed: newVerification.usnClaimed,
          },
        },
      });
    } catch (err) {
      next(err);
      return;
    }
  }

  /**
   * Generic Registration Endpoint (POST /api/auth/register)
   * Dispatches to student registration or handles legacy/fallback roles.
   */
  static async register(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const role = req.body.role;

      if (!role || role === 'STUDENT') {
        // Normalize fields if payload used legacy firstName/lastName
        const body = { ...req.body };
        if (!body.fullName && (body.firstName || body.lastName)) {
          body.fullName = `${body.firstName || ''} ${body.lastName || ''}`.trim();
        }
        if (!body.degree && body.degreeProgram) {
          body.degree = body.degreeProgram;
        }
        if (!body.expectedGraduationYear && body.graduationYear) {
          body.expectedGraduationYear = body.graduationYear;
        }
        req.body = body;
        return AuthController.registerStudent(req, res, next);
      }

      // Alumni and Admin registration are reserved for Phase 2/Administration
      throw new BadRequestError(
        'Self-registration is currently restricted to Students. Alumni onboarding is managed through institutional invitation.'
      );
    } catch (err) {
      next(err);
      return;
    }
  }

  /**
   * User Authentication & Login (POST /api/auth/login)
   * Authenticates credentials, checks account status, returns JWT.
   */
  static async login(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const parsed = loginSchema.parse(req.body);
      const normalizedEmail = parsed.email.trim().toLowerCase();

      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: {
          studentProfile: true,
          alumniProfile: true,
          adminProfile: true,
        },
      });

      if (!user) {
        throw new BadRequestError('Invalid email or password credentials');
      }

      if (!user.isActive) {
        throw new ForbiddenError('This account has been deactivated. Please contact college administration.');
      }

      const isMatch = await bcrypt.compare(parsed.password, user.passwordHash);
      if (!isMatch) {
        throw new BadRequestError('Invalid email or password credentials');
      }

      // Check account suspension
      if (user.status === AccountStatus.SUSPENDED) {
        throw new ForbiddenError(
          'Your account has been suspended by administration. Please submit an appeal to institutional support.'
        );
      }

      // Generate JWT with server-verified role and id
      const token = jwt.sign(
        { userId: user.id, role: user.role, email: user.email },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN as unknown as jwt.SignOptions['expiresIn'] }
      );

      return ApiResponse.success(res, {
        message: 'Authentication successful',
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            role: user.role,
            status: user.status,
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
      return;
    }
  }

  /**
   * Returns current authenticated user and verification details (GET /api/auth/me)
   */
  static async getMe(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          fullName: true,
          phoneNumber: true,
          role: true,
          status: true,
          isEmailVerified: true,
          avatarUrl: true,
          createdAt: true,
          studentProfile: {
            include: {
              verifications: {
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          },
          alumniProfile: true,
          adminProfile: true,
        },
      });

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      return ApiResponse.success(res, {
        message: 'Current profile retrieved',
        data: { user },
      });
    } catch (err) {
      next(err);
      return;
    }
  }

  /**
   * Demo accounts for evaluation and testing
   */
  static async getDemoAccounts(req: Request, res: Response): Promise<Response | void> {
    return ApiResponse.success(res, {
      message: 'Demo accounts for development and testing',
      data: [
        {
          role: 'ADMIN',
          email: 'admin@alumniconnect.edu',
          password: 'Password123!',
          description: 'Institutional Admin with access to pending alumni/student verifications and audit logs',
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
          description: 'Verified 3rd-year CS student with full networking features unlocked',
        },
      ],
    });
  }
}
