import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { ApiResponse } from '../utils/apiResponse';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
} from '../utils/appError';
import {
  UserRole,
  AccountStatus,
  VerificationStatus,
  AdminActionType,
  AnnouncementCategory,
  AnnouncementAudience,
  AnnouncementPriority,
  AnnouncementStatus,
  AppealStatus,
  AppealAction,
} from '@prisma/client';

// -------------------------------------------------------------
// VALIDATION SCHEMAS
// -------------------------------------------------------------
const reviewVerificationSchema = z
  .object({
    decision: z.enum(['APPROVE', 'REJECT']),
    reason: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.decision === 'REJECT') {
        return !!data.reason && data.reason.trim().length >= 5;
      }
      return true;
    },
    {
      message: 'A detailed reason (at least 5 characters) is required when rejecting verification.',
      path: ['reason'],
    }
  );

const userModerationSchema = z.object({
  reason: z.string().min(5, 'Action reason must be at least 5 characters.'),
});

const resolveAppealSchema = z.object({
  decision: z.enum(['APPROVE', 'REJECT']),
  resolutionVerdict: z.string().min(5, 'Resolution verdict must be at least 5 characters.'),
});

const announcementCreateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  category: z.nativeEnum(AnnouncementCategory),
  content: z.string().min(10, 'Content must be at least 10 characters.'),
  targetAudience: z.nativeEnum(AnnouncementAudience).default(AnnouncementAudience.ALL),
  targetDepartment: z.string().optional().nullable(),
  targetBatchYear: z.number().int().optional().nullable(),
  priority: z.nativeEnum(AnnouncementPriority).default(AnnouncementPriority.NORMAL),
  status: z.nativeEnum(AnnouncementStatus).default(AnnouncementStatus.PUBLISHED),
  attachmentUrl: z.string().url().optional().nullable().or(z.literal('')),
});

const announcementUpdateSchema = announcementCreateSchema.partial();

// -------------------------------------------------------------
// HELPER: GET OR CREATE ADMIN PROFILE
// -------------------------------------------------------------
async function getAdminProfile(userId: string) {
  let profile = await prisma.adminProfile.findUnique({
    where: { userId },
    include: { user: true },
  });

  if (!profile) {
    profile = await prisma.adminProfile.create({
      data: {
        userId,
        employeeId: `ADM-${userId.slice(-6).toUpperCase()}`,
        department: 'Career Development Centre & Alumni Relations',
        designation: 'Institutional Admin',
        permissions: 'SUPER_ADMIN,VERIFY_STUDENT,VERIFY_ALUMNI,MANAGE_USERS,ANNOUNCEMENTS',
      },
      include: { user: true },
    });
  }

  return profile;
}

// -------------------------------------------------------------
// ADMIN CONTROLLER
// -------------------------------------------------------------
export class AdminController {
  /**
   * GET /api/admin/dashboard/summary
   * Returns live MySQL statistics for CDC overview.
   */
  static async getDashboardSummary(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        throw new ForbiddenError('Admin access required.');
      }

      const adminProfile = await getAdminProfile(req.user.id);

      // Aggregate counts from MySQL
      const [
        totalStudents,
        totalAlumni,
        pendingStudents,
        pendingAlumni,
        verifiedUsers,
        rejectedUsers,
        suspendedUsers,
        pendingAppeals,
        totalAnnouncements,
        recentAuditLogs,
      ] = await Promise.all([
        prisma.user.count({ where: { role: UserRole.STUDENT } }),
        prisma.user.count({ where: { role: UserRole.ALUMNI } }),
        prisma.user.count({
          where: { role: UserRole.STUDENT, status: AccountStatus.PENDING_VERIFICATION },
        }),
        prisma.user.count({
          where: { role: UserRole.ALUMNI, status: AccountStatus.PENDING_VERIFICATION },
        }),
        prisma.user.count({ where: { status: AccountStatus.VERIFIED } }),
        prisma.user.count({ where: { status: AccountStatus.REJECTED } }),
        prisma.user.count({ where: { status: AccountStatus.SUSPENDED } }),
        prisma.accountAppeal.count({ where: { status: AppealStatus.PENDING } }),
        prisma.announcement.count(),
        prisma.adminAuditLog.findMany({
          take: 8,
          orderBy: { createdAt: 'desc' },
          include: {
            admin: {
              include: {
                user: {
                  select: { fullName: true, email: true },
                },
              },
            },
          },
        }),
      ]);

      // Department breakdown for students
      const departmentDistribution = await prisma.studentProfile.groupBy({
        by: ['department'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 6,
      });

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Admin dashboard summary retrieved successfully.',
        data: {
          admin: {
            name: req.user.fullName || adminProfile.user.fullName,
            email: req.user.email,
            employeeId: adminProfile.employeeId,
            department: adminProfile.department,
            designation: adminProfile.designation,
          },
          metrics: {
            totalStudents,
            totalAlumni,
            pendingStudents,
            pendingAlumni,
            totalPendingVerifications: pendingStudents + pendingAlumni,
            verifiedUsers,
            rejectedUsers,
            suspendedUsers,
            pendingAppeals,
            totalAnnouncements,
          },
          departmentDistribution: departmentDistribution.map((d) => ({
            department: d.department,
            studentCount: d._count.id,
          })),
          recentAuditLogs: recentAuditLogs.map((log) => ({
            id: log.id,
            action: log.action,
            targetType: log.targetType,
            targetId: log.targetId,
            reason: log.reason,
            performedBy: log.admin.user.fullName || log.admin.employeeId,
            createdAt: log.createdAt,
          })),
        },
      });
    } catch (err) {
      next(err);
      return;
    }
  }

  /**
   * GET /api/admin/students
   * Search and filter student records.
   */
  static async getStudents(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const search = (req.query.search as string) || '';
      const status = req.query.status as string;
      const department = req.query.department as string;
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 15));
      const skip = (page - 1) * limit;

      const whereClause: any = {
        role: UserRole.STUDENT,
      };

      if (status && status !== 'ALL') {
        whereClause.status = status as AccountStatus;
      }

      if (search) {
        whereClause.OR = [
          { fullName: { contains: search } },
          { email: { contains: search } },
          { studentProfile: { rollNumber: { contains: search } } },
        ];
      }

      if (department && department !== 'ALL') {
        whereClause.studentProfile = {
          ...whereClause.studentProfile,
          department,
        };
      }

      const [total, students] = await Promise.all([
        prisma.user.count({ where: whereClause }),
        prisma.user.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            email: true,
            fullName: true,
            phoneNumber: true,
            status: true,
            isActive: true,
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
          },
        }),
      ]);

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Students retrieved successfully.',
        data: {
          students,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (err) {
      next(err);
      return;
    }
  }

  /**
   * GET /api/admin/students/:id
   * Get complete student details with verification audit trail.
   */
  static async getStudentById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;

      const user = await prisma.user.findFirst({
        where: { id, role: UserRole.STUDENT },
        select: {
          id: true,
          email: true,
          fullName: true,
          phoneNumber: true,
          status: true,
          isActive: true,
          isEmailVerified: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
          studentProfile: {
            include: {
              verifications: {
                orderBy: { createdAt: 'desc' },
                include: {
                  reviewedByAdmin: {
                    include: {
                      user: { select: { fullName: true, email: true } },
                    },
                  },
                },
              },
            },
          },
          accountAppeals: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!user) {
        throw new NotFoundError('Student user not found.');
      }

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Student details retrieved.',
        data: { student: user },
      });
    } catch (err) {
      next(err);
      return;
    }
  }

  /**
   * POST /api/admin/students/:id/verify
   * Review student verification: approve or reject with reason.
   */
  static async reviewStudentVerification(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { id } = req.params;
      const parsed = reviewVerificationSchema.parse(req.body);
      const adminProfile = await getAdminProfile(req.user.id);

      const studentUser = await prisma.user.findUnique({
        where: { id },
        include: { studentProfile: { include: { verifications: true } } },
      });

      if (!studentUser || studentUser.role !== UserRole.STUDENT || !studentUser.studentProfile) {
        throw new NotFoundError('Student profile not found.');
      }

      const previousStatus = studentUser.status;
      const newStatus =
        parsed.decision === 'APPROVE' ? AccountStatus.VERIFIED : AccountStatus.REJECTED;
      const newVerifStatus =
        parsed.decision === 'APPROVE' ? VerificationStatus.APPROVED : VerificationStatus.REJECTED;
      const actionType =
        parsed.decision === 'APPROVE' ? AdminActionType.USER_APPROVE : AdminActionType.USER_REJECT;

      const reason =
        parsed.reason ||
        (parsed.decision === 'APPROVE'
          ? 'Academic registration number and enrollment credentials verified by CDC administration.'
          : 'Verification rejected by administration.');

      const ipAddress =
        (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'CDC-Portal';

      // Atomic transaction: update user status, student profile, verification audit record & admin audit log
      const result = await prisma.$transaction(async (tx) => {
        // 1. Update user
        const updatedUser = await tx.user.update({
          where: { id },
          data: {
            status: newStatus,
            isActive: true,
          },
        });

        // 2. Update student profile
        await tx.studentProfile.update({
          where: { id: studentUser.studentProfile!.id },
          data: {
            isVerified: parsed.decision === 'APPROVE',
          },
        });

        // 3. Update or create StudentVerification entry
        const latestVerif = studentUser.studentProfile!.verifications[0];
        if (latestVerif) {
          await tx.studentVerification.update({
            where: { id: latestVerif.id },
            data: {
              status: newVerifStatus,
              reviewNotes: reason,
              reviewedByAdminId: adminProfile.id,
              reviewedAt: new Date(),
            },
          });
        } else {
          await tx.studentVerification.create({
            data: {
              studentProfileId: studentUser.studentProfile!.id,
              status: newVerifStatus,
              usnClaimed: studentUser.studentProfile!.rollNumber,
              reviewNotes: reason,
              reviewedByAdminId: adminProfile.id,
              reviewedAt: new Date(),
            },
          });
        }

        // 4. Record AdminAuditLog
        const auditLog = await tx.adminAuditLog.create({
          data: {
            adminId: adminProfile.id,
            action: actionType,
            targetType: 'STUDENT',
            targetId: studentUser.id,
            reason,
            previousState: JSON.stringify({ status: previousStatus }),
            newState: JSON.stringify({ status: newStatus, decision: parsed.decision }),
            ipAddress,
            userAgent,
          },
        });

        return { user: updatedUser, auditLog };
      });

      return ApiResponse.success(res, {
        statusCode: 200,
        message: `Student verification ${parsed.decision === 'APPROVE' ? 'approved' : 'rejected'} successfully.`,
        data: result,
      });
    } catch (err) {
      next(err);
      return;
    }
  }

  /**
   * GET /api/admin/alumni
   * Search and filter alumni records.
   */
  static async getAlumni(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const search = (req.query.search as string) || '';
      const status = req.query.status as string;
      const department = req.query.department as string;
      const company = req.query.company as string;
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 15));
      const skip = (page - 1) * limit;

      const whereClause: any = {
        role: UserRole.ALUMNI,
      };

      if (status && status !== 'ALL') {
        whereClause.status = status as AccountStatus;
      }

      if (search) {
        whereClause.OR = [
          { fullName: { contains: search } },
          { email: { contains: search } },
          { alumniProfile: { rollNumber: { contains: search } } },
          { alumniProfile: { currentCompany: { contains: search } } },
          { alumniProfile: { currentDesignation: { contains: search } } },
        ];
      }

      if (department && department !== 'ALL') {
        whereClause.alumniProfile = {
          ...whereClause.alumniProfile,
          department,
        };
      }

      if (company) {
        whereClause.alumniProfile = {
          ...whereClause.alumniProfile,
          currentCompany: { contains: company },
        };
      }

      const [total, alumni] = await Promise.all([
        prisma.user.count({ where: whereClause }),
        prisma.user.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            email: true,
            fullName: true,
            phoneNumber: true,
            status: true,
            isActive: true,
            avatarUrl: true,
            createdAt: true,
            alumniProfile: {
              include: {
                verifications: {
                  orderBy: { createdAt: 'desc' },
                  take: 1,
                },
              },
            },
          },
        }),
      ]);

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Alumni retrieved successfully.',
        data: {
          alumni,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (err) {
      next(err);
      return;
    }
  }

  /**
   * GET /api/admin/alumni/:id
   * Get complete alumni details with verification audit trail.
   */
  static async getAlumniById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;

      const user = await prisma.user.findFirst({
        where: { id, role: UserRole.ALUMNI },
        select: {
          id: true,
          email: true,
          fullName: true,
          phoneNumber: true,
          status: true,
          isActive: true,
          isEmailVerified: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
          alumniProfile: {
            include: {
              verifications: {
                orderBy: { createdAt: 'desc' },
                include: {
                  reviewedByAdmin: {
                    include: {
                      user: { select: { fullName: true, email: true } },
                    },
                  },
                },
              },
            },
          },
          accountAppeals: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!user) {
        throw new NotFoundError('Alumni user not found.');
      }

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Alumni details retrieved.',
        data: { alumni: user },
      });
    } catch (err) {
      next(err);
      return;
    }
  }

  /**
   * POST /api/admin/alumni/:id/verify
   * Review alumni verification: approve or reject with reason.
   */
  static async reviewAlumniVerification(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { id } = req.params;
      const parsed = reviewVerificationSchema.parse(req.body);
      const adminProfile = await getAdminProfile(req.user.id);

      const alumniUser = await prisma.user.findUnique({
        where: { id },
        include: { alumniProfile: { include: { verifications: true } } },
      });

      if (!alumniUser || alumniUser.role !== UserRole.ALUMNI || !alumniUser.alumniProfile) {
        throw new NotFoundError('Alumni profile not found.');
      }

      const previousStatus = alumniUser.status;
      const newStatus =
        parsed.decision === 'APPROVE' ? AccountStatus.VERIFIED : AccountStatus.REJECTED;
      const newVerifStatus =
        parsed.decision === 'APPROVE' ? VerificationStatus.APPROVED : VerificationStatus.REJECTED;
      const actionType =
        parsed.decision === 'APPROVE' ? AdminActionType.USER_APPROVE : AdminActionType.USER_REJECT;

      const reason =
        parsed.reason ||
        (parsed.decision === 'APPROVE'
          ? 'Graduate degree and professional employment credentials verified by CDC administration.'
          : 'Verification rejected by administration.');

      const ipAddress =
        (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'CDC-Portal';

      // Atomic transaction: update user status, alumni profile, verification audit record & admin audit log
      const result = await prisma.$transaction(async (tx) => {
        // 1. Update user
        const updatedUser = await tx.user.update({
          where: { id },
          data: {
            status: newStatus,
            isActive: true,
          },
        });

        // 2. Update alumni profile
        await tx.alumniProfile.update({
          where: { id: alumniUser.alumniProfile!.id },
          data: {
            isVerified: parsed.decision === 'APPROVE',
          },
        });

        // 3. Update or create AlumniVerification entry
        const latestVerif = alumniUser.alumniProfile!.verifications[0];
        if (latestVerif) {
          await tx.alumniVerification.update({
            where: { id: latestVerif.id },
            data: {
              status: newVerifStatus,
              reviewNotes: reason,
              reviewedByAdminId: adminProfile.id,
              reviewedAt: new Date(),
            },
          });
        } else {
          await tx.alumniVerification.create({
            data: {
              alumniProfileId: alumniUser.alumniProfile!.id,
              status: newVerifStatus,
              reviewNotes: reason,
              reviewedByAdminId: adminProfile.id,
              reviewedAt: new Date(),
            },
          });
        }

        // 4. Record AdminAuditLog
        const auditLog = await tx.adminAuditLog.create({
          data: {
            adminId: adminProfile.id,
            action: actionType,
            targetType: 'ALUMNI',
            targetId: alumniUser.id,
            reason,
            previousState: JSON.stringify({ status: previousStatus }),
            newState: JSON.stringify({ status: newStatus, decision: parsed.decision }),
            ipAddress,
            userAgent,
          },
        });

        return { user: updatedUser, auditLog };
      });

      return ApiResponse.success(res, {
        statusCode: 200,
        message: `Alumni verification ${parsed.decision === 'APPROVE' ? 'approved' : 'rejected'} successfully.`,
        data: result,
      });
    } catch (err) {
      next(err);
      return;
    }
  }

  /**
   * POST /api/admin/users/:userId/suspend
   * Suspend a student or alumni account with required justification.
   */
  static async suspendUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { userId } = req.params;
      const parsed = userModerationSchema.parse(req.body);
      const adminProfile = await getAdminProfile(req.user.id);

      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!targetUser) {
        throw new NotFoundError('Target user not found.');
      }

      if (targetUser.role === UserRole.ADMIN) {
        throw new ForbiddenError('Administrative accounts cannot be suspended through this portal.');
      }

      const previousStatus = targetUser.status;
      const ipAddress =
        (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'CDC-Portal';

      const updatedUser = await prisma.$transaction(async (tx) => {
        const u = await tx.user.update({
          where: { id: userId },
          data: {
            status: AccountStatus.SUSPENDED,
            isActive: false,
          },
        });

        await tx.adminAuditLog.create({
          data: {
            adminId: adminProfile.id,
            action: AdminActionType.USER_SUSPEND,
            targetType: targetUser.role,
            targetId: targetUser.id,
            reason: parsed.reason,
            previousState: JSON.stringify({ status: previousStatus, isActive: targetUser.isActive }),
            newState: JSON.stringify({ status: AccountStatus.SUSPENDED, isActive: false }),
            ipAddress,
            userAgent,
          },
        });

        return u;
      });

      return ApiResponse.success(res, {
        statusCode: 200,
        message: `Account suspended successfully: ${targetUser.email}`,
        data: { user: updatedUser },
      });
    } catch (err) {
      next(err);
      return;
    }
  }

  /**
   * POST /api/admin/users/:userId/reinstate
   * Reinstate a suspended or rejected student or alumni account.
   */
  static async reinstateUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { userId } = req.params;
      const parsed = userModerationSchema.parse(req.body);
      const adminProfile = await getAdminProfile(req.user.id);

      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { studentProfile: true, alumniProfile: true },
      });

      if (!targetUser) {
        throw new NotFoundError('Target user not found.');
      }

      const previousStatus = targetUser.status;
      const ipAddress =
        (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'CDC-Portal';

      const updatedUser = await prisma.$transaction(async (tx) => {
        const u = await tx.user.update({
          where: { id: userId },
          data: {
            status: AccountStatus.VERIFIED,
            isActive: true,
          },
        });

        if (targetUser.studentProfile) {
          await tx.studentProfile.update({
            where: { id: targetUser.studentProfile.id },
            data: { isVerified: true },
          });
        }

        if (targetUser.alumniProfile) {
          await tx.alumniProfile.update({
            where: { id: targetUser.alumniProfile.id },
            data: { isVerified: true },
          });
        }

        await tx.adminAuditLog.create({
          data: {
            adminId: adminProfile.id,
            action: AdminActionType.USER_REINSTATE,
            targetType: targetUser.role,
            targetId: targetUser.id,
            reason: parsed.reason,
            previousState: JSON.stringify({ status: previousStatus, isActive: targetUser.isActive }),
            newState: JSON.stringify({ status: AccountStatus.VERIFIED, isActive: true }),
            ipAddress,
            userAgent,
          },
        });

        return u;
      });

      return ApiResponse.success(res, {
        statusCode: 200,
        message: `Account reinstated successfully: ${targetUser.email}`,
        data: { user: updatedUser },
      });
    } catch (err) {
      next(err);
      return;
    }
  }

  /**
   * GET /api/admin/appeals
   * List student and alumni appeals.
   */
  static async getAppeals(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const status = req.query.status as string;
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 15));
      const skip = (page - 1) * limit;

      const whereClause: any = {};
      if (status && status !== 'ALL') {
        whereClause.status = status as AppealStatus;
      }

      const [total, appeals] = await Promise.all([
        prisma.accountAppeal.count({ where: whereClause }),
        prisma.accountAppeal.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                status: true,
                phoneNumber: true,
              },
            },
            reviewedByAdmin: {
              include: {
                user: { select: { fullName: true, email: true } },
              },
            },
          },
        }),
      ]);

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Appeals retrieved successfully.',
        data: {
          appeals,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (err) {
      next(err);
      return;
    }
  }

  /**
   * POST /api/admin/appeals/:appealId/resolve
   * Resolve an appeal: either approve (reinstates account) or reject.
   */
  static async resolveAppeal(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { appealId } = req.params;
      const parsed = resolveAppealSchema.parse(req.body);
      const adminProfile = await getAdminProfile(req.user.id);

      const appeal = await prisma.accountAppeal.findUnique({
        where: { id: appealId },
        include: { user: { include: { studentProfile: true, alumniProfile: true } } },
      });

      if (!appeal) {
        throw new NotFoundError('Appeal record not found.');
      }

      const ipAddress =
        (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'CDC-Portal';

      const resolved = await prisma.$transaction(async (tx) => {
        const updatedAppeal = await tx.accountAppeal.update({
          where: { id: appealId },
          data: {
            status: parsed.decision === 'APPROVE' ? AppealStatus.APPROVED : AppealStatus.REJECTED,
            resolutionVerdict: parsed.resolutionVerdict,
            reviewedByAdminId: adminProfile.id,
            reviewedAt: new Date(),
          },
        });

        if (parsed.decision === 'APPROVE') {
          // Reinstate user
          await tx.user.update({
            where: { id: appeal.userId },
            data: {
              status: AccountStatus.VERIFIED,
              isActive: true,
            },
          });

          if (appeal.user.studentProfile) {
            await tx.studentProfile.update({
              where: { id: appeal.user.studentProfile.id },
              data: { isVerified: true },
            });
          }

          if (appeal.user.alumniProfile) {
            await tx.alumniProfile.update({
              where: { id: appeal.user.alumniProfile.id },
              data: { isVerified: true },
            });
          }
        }

        // Record audit log
        await tx.adminAuditLog.create({
          data: {
            adminId: adminProfile.id,
            action: AdminActionType.APPEAL_RESOLVE,
            targetType: 'ACCOUNT_APPEAL',
            targetId: appealId,
            reason: `Appeal ${parsed.decision}: ${parsed.resolutionVerdict}`,
            previousState: JSON.stringify({ status: appeal.status }),
            newState: JSON.stringify({
              status: updatedAppeal.status,
              verdict: parsed.resolutionVerdict,
            }),
            ipAddress,
            userAgent,
          },
        });

        return updatedAppeal;
      });

      return ApiResponse.success(res, {
        statusCode: 200,
        message: `Appeal marked as ${parsed.decision === 'APPROVE' ? 'Approved' : 'Rejected'}.`,
        data: { appeal: resolved },
      });
    } catch (err) {
      next(err);
      return;
    }
  }

  /**
   * GET /api/admin/announcements
   * Get all announcements (drafts and published) for admin management.
   */
  static async getAnnouncements(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const announcements = await prisma.announcement.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          authorAdmin: {
            include: {
              user: { select: { fullName: true, email: true } },
            },
          },
        },
      });

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Announcements retrieved.',
        data: { announcements },
      });
    } catch (err) {
      next(err);
      return;
    }
  }

  /**
   * POST /api/admin/announcements
   * Create an institutional announcement.
   */
  static async createAnnouncement(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const parsed = announcementCreateSchema.parse(req.body);
      const adminProfile = await getAdminProfile(req.user.id);

      const ipAddress =
        (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'CDC-Portal';

      const announcement = await prisma.$transaction(async (tx) => {
        const a = await tx.announcement.create({
          data: {
            authorAdminId: adminProfile.id,
            title: parsed.title,
            category: parsed.category,
            content: parsed.content,
            targetAudience: parsed.targetAudience,
            targetDepartment: parsed.targetDepartment || null,
            targetBatchYear: parsed.targetBatchYear || null,
            priority: parsed.priority,
            status: parsed.status,
            attachmentUrl: parsed.attachmentUrl || null,
            publishedAt: parsed.status === AnnouncementStatus.PUBLISHED ? new Date() : new Date(),
          },
        });

        await tx.adminAuditLog.create({
          data: {
            adminId: adminProfile.id,
            action: AdminActionType.ANNOUNCEMENT_CREATE,
            targetType: 'ANNOUNCEMENT',
            targetId: a.id,
            reason: `Created announcement: "${parsed.title}"`,
            newState: JSON.stringify({ title: a.title, status: a.status, audience: a.targetAudience }),
            ipAddress,
            userAgent,
          },
        });

        return a;
      });

      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'Announcement created successfully.',
        data: { announcement },
      });
    } catch (err) {
      next(err);
      return;
    }
  }

  /**
   * PUT /api/admin/announcements/:id
   * Edit an announcement.
   */
  static async updateAnnouncement(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { id } = req.params;
      const parsed = announcementUpdateSchema.parse(req.body);
      const adminProfile = await getAdminProfile(req.user.id);

      const existing = await prisma.announcement.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError('Announcement not found.');
      }

      const ipAddress =
        (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'CDC-Portal';

      const updated = await prisma.$transaction(async (tx) => {
        const a = await tx.announcement.update({
          where: { id },
          data: {
            ...(parsed.title && { title: parsed.title }),
            ...(parsed.category && { category: parsed.category }),
            ...(parsed.content && { content: parsed.content }),
            ...(parsed.targetAudience && { targetAudience: parsed.targetAudience }),
            ...(parsed.targetDepartment !== undefined && { targetDepartment: parsed.targetDepartment }),
            ...(parsed.targetBatchYear !== undefined && { targetBatchYear: parsed.targetBatchYear }),
            ...(parsed.priority && { priority: parsed.priority }),
            ...(parsed.status && { status: parsed.status }),
            ...(parsed.attachmentUrl !== undefined && { attachmentUrl: parsed.attachmentUrl }),
          },
        });

        await tx.adminAuditLog.create({
          data: {
            adminId: adminProfile.id,
            action: AdminActionType.ANNOUNCEMENT_UPDATE,
            targetType: 'ANNOUNCEMENT',
            targetId: a.id,
            reason: `Updated announcement: "${a.title}"`,
            previousState: JSON.stringify({ title: existing.title, status: existing.status }),
            newState: JSON.stringify({ title: a.title, status: a.status }),
            ipAddress,
            userAgent,
          },
        });

        return a;
      });

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Announcement updated successfully.',
        data: { announcement: updated },
      });
    } catch (err) {
      next(err);
      return;
    }
  }

  /**
   * PATCH /api/admin/announcements/:id/status
   * Publish, unpublish or archive announcement.
   */
  static async toggleAnnouncementStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { id } = req.params;
      const statusSchema = z.object({
        status: z.nativeEnum(AnnouncementStatus),
      });
      const parsed = statusSchema.parse(req.body);
      const adminProfile = await getAdminProfile(req.user.id);

      const existing = await prisma.announcement.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError('Announcement not found.');
      }

      const ipAddress =
        (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'CDC-Portal';

      const updated = await prisma.$transaction(async (tx) => {
        const a = await tx.announcement.update({
          where: { id },
          data: {
            status: parsed.status,
            publishedAt: parsed.status === AnnouncementStatus.PUBLISHED ? new Date() : existing.publishedAt,
          },
        });

        await tx.adminAuditLog.create({
          data: {
            adminId: adminProfile.id,
            action: AdminActionType.ANNOUNCEMENT_PUBLISH,
            targetType: 'ANNOUNCEMENT',
            targetId: a.id,
            reason: `Announcement status changed to ${parsed.status}`,
            previousState: JSON.stringify({ status: existing.status }),
            newState: JSON.stringify({ status: a.status }),
            ipAddress,
            userAgent,
          },
        });

        return a;
      });

      return ApiResponse.success(res, {
        statusCode: 200,
        message: `Announcement status updated to ${parsed.status}.`,
        data: { announcement: updated },
      });
    } catch (err) {
      next(err);
      return;
    }
  }

  /**
   * DELETE /api/admin/announcements/:id
   * Permanently delete an announcement.
   */
  static async deleteAnnouncement(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { id } = req.params;
      const adminProfile = await getAdminProfile(req.user.id);

      const existing = await prisma.announcement.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError('Announcement not found.');
      }

      const ipAddress =
        (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'CDC-Portal';

      await prisma.$transaction(async (tx) => {
        await tx.announcement.delete({ where: { id } });

        await tx.adminAuditLog.create({
          data: {
            adminId: adminProfile.id,
            action: AdminActionType.ANNOUNCEMENT_DELETE,
            targetType: 'ANNOUNCEMENT',
            targetId: id,
            reason: `Deleted announcement: "${existing.title}"`,
            previousState: JSON.stringify({ title: existing.title }),
            ipAddress,
            userAgent,
          },
        });
      });

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Announcement deleted successfully.',
      });
    } catch (err) {
      next(err);
      return;
    }
  }

  /**
   * GET /api/admin/audit-logs
   * Read-only institutional activity log.
   */
  static async getAuditLogs(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const search = (req.query.search as string) || '';
      const action = req.query.action as string;
      const targetType = req.query.targetType as string;
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
      const skip = (page - 1) * limit;

      const whereClause: any = {};

      if (action && action !== 'ALL') {
        whereClause.action = action as AdminActionType;
      }

      if (targetType && targetType !== 'ALL') {
        whereClause.targetType = targetType;
      }

      if (search) {
        whereClause.OR = [
          { reason: { contains: search } },
          { targetId: { contains: search } },
          { admin: { user: { fullName: { contains: search } } } },
        ];
      }

      const [total, logs] = await Promise.all([
        prisma.adminAuditLog.count({ where: whereClause }),
        prisma.adminAuditLog.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            admin: {
              include: {
                user: {
                  select: { fullName: true, email: true },
                },
              },
            },
          },
        }),
      ]);

      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Audit logs retrieved successfully.',
        data: {
          logs: logs.map((l) => ({
            id: l.id,
            action: l.action,
            targetType: l.targetType,
            targetId: l.targetId,
            reason: l.reason,
            previousState: l.previousState,
            newState: l.newState,
            ipAddress: l.ipAddress,
            userAgent: l.userAgent,
            createdAt: l.createdAt,
            admin: {
              id: l.admin.id,
              employeeId: l.admin.employeeId,
              name: l.admin.user.fullName,
              email: l.admin.user.email,
              department: l.admin.department,
            },
          })),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (err) {
      next(err);
      return;
    }
  }
}
