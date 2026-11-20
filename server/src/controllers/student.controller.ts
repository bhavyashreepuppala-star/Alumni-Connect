import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { ApiResponse } from '../utils/apiResponse';
import { BadRequestError, NotFoundError, UnauthorizedError, ForbiddenError } from '../utils/appError';
import { AccountStatus, VerificationStatus, AppealAction } from '@prisma/client';

// Schema for permitted student profile updates
const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100).optional(),
  phoneNumber: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => !val || /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/.test(val),
      'Please enter a valid phone number'
    ),
  headline: z.string().trim().max(191, 'Headline cannot exceed 191 characters').optional().or(z.literal('')),
  bio: z.string().trim().max(2000, 'Bio cannot exceed 2000 characters').optional().or(z.literal('')),
  githubUrl: z
    .string()
    .trim()
    .url('Please provide a valid URL')
    .optional()
    .or(z.literal('')),
  linkedinUrl: z
    .string()
    .trim()
    .url('Please provide a valid URL')
    .optional()
    .or(z.literal('')),
  portfolioUrl: z
    .string()
    .trim()
    .url('Please provide a valid URL')
    .optional()
    .or(z.literal('')),
  cgpa: z.coerce.number().min(0, 'CGPA cannot be negative').max(10, 'CGPA cannot exceed 10.0').optional(),
  currentSemester: z.coerce.number().int().min(1).max(12).optional(),
});

const appealSchema = z.object({
  appealStatement: z
    .string({ required_error: 'Appeal statement is required' })
    .trim()
    .min(10, 'Appeal statement must be at least 10 characters')
    .max(2000, 'Appeal statement cannot exceed 2000 characters'),
  supplementalDocUrl: z.string().trim().url('Invalid document URL').optional().or(z.literal('')),
});

export class StudentController {
  /**
   * GET /api/student/profile
   * Returns current student's full verified profile and academic records.
   */
  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
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
          userSkills: {
            include: {
              skill: true,
            },
          },
        },
      });

      if (!user || !user.studentProfile) {
        throw new NotFoundError('Student profile not found');
      }

      return ApiResponse.success(res, {
        message: 'Student profile retrieved',
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            role: user.role,
            status: user.status,
            isEmailVerified: user.isEmailVerified,
            avatarUrl: user.avatarUrl,
            createdAt: user.createdAt,
          },
          profile: user.studentProfile,
          skills: user.userSkills.map((us) => ({
            id: us.skill.id,
            name: us.skill.name,
            category: us.skill.category,
            proficiency: us.proficiency,
            endorsementsCount: us.endorsementsCount,
          })),
        },
      });
    } catch (err) {
      next(err);
      return;
    }
  }

  /**
   * PUT /api/student/profile
   * Updates permitted profile fields with strict ownership enforcement.
   * Modifying USN, department, degree, role, status or isVerified is strictly prohibited.
   */
  static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const parsed = updateProfileSchema.parse(req.body);

      // Verify student profile exists
      const currentProfile = await prisma.studentProfile.findUnique({
        where: { userId: req.user.id },
      });

      if (!currentProfile) {
        throw new NotFoundError('Student profile not found');
      }

      // Execute update inside transaction with ownership check
      const { updatedUser, updatedProfile } = await prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
          where: { id: req.user!.id },
          data: {
            fullName: parsed.fullName !== undefined ? parsed.fullName : undefined,
            phoneNumber: parsed.phoneNumber !== undefined ? (parsed.phoneNumber || null) : undefined,
          },
        });

        const profile = await tx.studentProfile.update({
          where: { userId: req.user!.id },
          data: {
            headline: parsed.headline !== undefined ? (parsed.headline || null) : undefined,
            bio: parsed.bio !== undefined ? (parsed.bio || null) : undefined,
            githubUrl: parsed.githubUrl !== undefined ? (parsed.githubUrl || null) : undefined,
            linkedinUrl: parsed.linkedinUrl !== undefined ? (parsed.linkedinUrl || null) : undefined,
            portfolioUrl: parsed.portfolioUrl !== undefined ? (parsed.portfolioUrl || null) : undefined,
            cgpa: parsed.cgpa !== undefined ? parsed.cgpa : undefined,
            currentSemester: parsed.currentSemester !== undefined ? parsed.currentSemester : undefined,
          },
        });

        return { updatedUser: user, updatedProfile: profile };
      });

      return ApiResponse.success(res, {
        message: 'Profile updated successfully',
        data: {
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            fullName: updatedUser.fullName,
            phoneNumber: updatedUser.phoneNumber,
            role: updatedUser.role,
            status: updatedUser.status,
          },
          profile: updatedProfile,
        },
      });
    } catch (err) {
      next(err);
      return;
    }
  }

  /**
   * GET /api/student/dashboard
   * Returns aggregated real database records for the student dashboard.
   */
  static async getDashboardSummary(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          studentProfile: {
            include: {
              verifications: {
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          },
          userSkills: {
            include: { skill: true },
          },
        },
      });

      if (!user || !user.studentProfile) {
        throw new NotFoundError('Student profile not found');
      }

      const profile = user.studentProfile;

      // Real counts from MySQL
      const [mentorshipRequestsCount, savedJobsCount, upcomingEventsCount, recentAnnouncements] =
        await Promise.all([
          prisma.mentorshipRequest.count({
            where: { studentId: profile.id },
          }),
          prisma.savedJob.count({
            where: { userId: user.id },
          }),
          prisma.eventRegistration.count({
            where: { userId: user.id },
          }),
          prisma.announcement.findMany({
            where: {
              status: 'PUBLISHED',
              targetAudience: { in: ['ALL', 'STUDENTS_ONLY'] },
            },
            orderBy: { publishedAt: 'desc' },
            take: 4,
          }),
        ]);

      // Calculate real profile completion percentage
      const completionChecks = [
        !!user.fullName && user.fullName.trim().length > 0,
        !!profile.rollNumber,
        !!profile.department,
        !!profile.degree,
        !!profile.currentSemester,
        !!profile.expectedGraduationYear,
        !!profile.headline,
        !!profile.bio,
        !!(profile.githubUrl || profile.linkedinUrl),
        !!user.phoneNumber,
      ];
      const completedCount = completionChecks.filter(Boolean).length;
      const profileCompletionPercentage = Math.round((completedCount / completionChecks.length) * 100);

      return ApiResponse.success(res, {
        message: 'Dashboard summary retrieved',
        data: {
          student: {
            id: user.id,
            profileId: profile.id,
            fullName: user.fullName || 'Student',
            email: user.email,
            phoneNumber: user.phoneNumber,
            avatarUrl: user.avatarUrl,
            status: user.status,
            isVerified: profile.isVerified,
            rollNumber: profile.rollNumber,
            department: profile.department,
            degree: profile.degree,
            currentSemester: profile.currentSemester,
            expectedGraduationYear: profile.expectedGraduationYear,
            cgpa: profile.cgpa,
            bio: profile.bio,
            headline: profile.headline,
            githubUrl: profile.githubUrl,
            linkedinUrl: profile.linkedinUrl,
            portfolioUrl: profile.portfolioUrl,
            latestVerification: profile.verifications[0] || null,
          },
          metrics: {
            mentorshipRequestsCount,
            savedJobsCount,
            upcomingEventsCount,
            skillsCount: user.userSkills.length,
            profileCompletionPercentage,
          },
          announcements: recentAnnouncements.map((a) => ({
            id: a.id,
            title: a.title,
            category: a.category,
            content: a.content,
            priority: a.priority,
            publishedAt: a.publishedAt,
          })),
        },
      });
    } catch (err) {
      next(err);
      return;
    }
  }

  /**
   * GET /api/student/verification-status
   * Returns student's actual verification state and sanitized notes from MySQL.
   */
  static async getVerificationStatus(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
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
          createdAt: true,
          studentProfile: {
            include: {
              verifications: {
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          },
          accountAppeals: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      if (!user || !user.studentProfile) {
        throw new NotFoundError('Student profile not found');
      }

      const latestVerif = user.studentProfile.verifications[0] || null;
      const latestAppeal = user.accountAppeals[0] || null;

      return ApiResponse.success(res, {
        message: 'Verification status retrieved',
        data: {
          accountStatus: user.status,
          isVerified: user.studentProfile.isVerified,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          rollNumber: user.studentProfile.rollNumber,
          department: user.studentProfile.department,
          degree: user.studentProfile.degree,
          currentSemester: user.studentProfile.currentSemester,
          expectedGraduationYear: user.studentProfile.expectedGraduationYear,
          bio: user.studentProfile.bio,
          headline: user.studentProfile.headline,
          linkedinUrl: user.studentProfile.linkedinUrl,
          githubUrl: user.studentProfile.githubUrl,
          verification: latestVerif
            ? {
                id: latestVerif.id,
                status: latestVerif.status,
                verificationMethod: latestVerif.verificationMethod,
                usnClaimed: latestVerif.usnClaimed,
                submissionNotes: latestVerif.submissionNotes,
                // Respectful public review reason if rejected; never expose internal audit metadata
                publicReviewReason: latestVerif.status === VerificationStatus.REJECTED ? latestVerif.reviewNotes : null,
                createdAt: latestVerif.createdAt,
              }
            : null,
          appeal: latestAppeal
            ? {
                id: latestAppeal.id,
                status: latestAppeal.status,
                appealStatement: latestAppeal.appealStatement,
                verdict: latestAppeal.resolutionVerdict,
                createdAt: latestAppeal.createdAt,
              }
            : null,
        },
      });
    } catch (err) {
      next(err);
      return;
    }
  }

  /**
   * POST /api/student/verification-appeal
   * Allows rejected or suspended students to submit an appeal.
   */
  static async submitAppeal(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      if (req.user.status !== AccountStatus.REJECTED && req.user.status !== AccountStatus.SUSPENDED) {
        throw new BadRequestError('Appeals are only permitted for rejected or suspended accounts.');
      }

      const parsed = appealSchema.parse(req.body);

      const appealAction =
        req.user.status === AccountStatus.REJECTED
          ? AppealAction.VERIFICATION_REJECTION
          : AppealAction.ACCOUNT_SUSPENSION;

      const newAppeal = await prisma.accountAppeal.create({
        data: {
          userId: req.user.id,
          actionAppealed: appealAction,
          appealStatement: parsed.appealStatement,
          supplementalDocUrl: parsed.supplementalDocUrl || null,
        },
      });

      return ApiResponse.success(res, {
        statusCode: 201,
        message: 'Appeal submitted successfully. Institutional administration will review your statement.',
        data: { appeal: newAppeal },
      });
    } catch (err) {
      next(err);
      return;
    }
  }

  /**
   * GET /api/student/alumni-directory
   * Returns list of real verified alumni from MySQL.
   * Gated: Only verified students can access.
   */
  static async getAlumniDirectory(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const alumni = await prisma.alumniProfile.findMany({
        where: {
          isVerified: true,
          user: {
            status: AccountStatus.VERIFIED,
            isActive: true,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { yearsOfExperience: 'desc' },
        take: 20,
      });

      return ApiResponse.success(res, {
        message: 'Alumni directory retrieved',
        data: {
          alumni: alumni.map((a) => ({
            id: a.id,
            userId: a.userId,
            fullName: a.user.fullName || 'Alumnus',
            avatarUrl: a.user.avatarUrl,
            degree: a.degree,
            department: a.department,
            graduationYear: a.graduationYear,
            currentCompany: a.currentCompany,
            currentDesignation: a.currentDesignation,
            industry: a.industry,
            yearsOfExperience: a.yearsOfExperience,
            city: a.city,
            country: a.country,
            bio: a.bio,
            linkedinUrl: a.linkedinUrl,
            isWillingToMentor: a.isWillingToMentor,
            maxMentees: a.maxMentees,
            mentorshipTopics: a.mentorshipTopics,
          })),
        },
      });
    } catch (err) {
      next(err);
      return;
    }
  }

  /**
   * GET /api/student/announcements
   * Returns published announcements from MySQL.
   */
  static async getAnnouncements(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const announcements = await prisma.announcement.findMany({
        where: {
          status: 'PUBLISHED',
          targetAudience: { in: ['ALL', 'STUDENTS_ONLY'] },
        },
        orderBy: { publishedAt: 'desc' },
        take: 20,
      });

      return ApiResponse.success(res, {
        message: 'Announcements retrieved',
        data: { announcements },
      });
    } catch (err) {
      next(err);
      return;
    }
  }

  /**
   * GET /api/student/mentorships
   * Returns mentorship requests submitted by the student from MySQL.
   * Gated: Only verified students can access.
   */
  static async getMentorshipRequests(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const profile = await prisma.studentProfile.findUnique({
        where: { userId: req.user.id },
      });

      if (!profile) {
        throw new NotFoundError('Student profile not found');
      }

      const requests = await prisma.mentorshipRequest.findMany({
        where: { studentId: profile.id },
        include: {
          alumni: {
            include: {
              user: {
                select: {
                  fullName: true,
                  avatarUrl: true,
                  email: true,
                },
              },
            },
          },
          session: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return ApiResponse.success(res, {
        message: 'Mentorship requests retrieved',
        data: {
          mentorships: requests.map((m) => ({
            id: m.id,
            topic: m.topic,
            reason: m.reason,
            status: m.status,
            alumniResponseNote: m.alumniResponseNote,
            createdAt: m.createdAt,
            alumni: {
              id: m.alumni.id,
              name: m.alumni.user.fullName || 'Alumnus',
              avatarUrl: m.alumni.user.avatarUrl,
              company: m.alumni.currentCompany,
              designation: m.alumni.currentDesignation,
            },
            session: m.session
              ? {
                  scheduledAt: m.session.scheduledAt,
                  durationMinutes: m.session.durationMinutes,
                  meetingType: m.session.meetingType,
                  meetingUrl: m.session.meetingUrl,
                  status: m.session.status,
                }
              : null,
          })),
        },
      });
    } catch (err) {
      next(err);
      return;
    }
  }
}
