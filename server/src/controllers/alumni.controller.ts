import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { ApiResponse } from '../utils/apiResponse';
import { BadRequestError, NotFoundError, UnauthorizedError, ForbiddenError } from '../utils/appError';
import { AccountStatus, VerificationStatus, AppealAction, MentorshipStatus, SessionStatus, MeetingType } from '@prisma/client';

// Schema for permitted alumni profile updates
const updateAlumniProfileSchema = z.object({
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
  currentCompany: z.string().trim().max(100).optional().or(z.literal('')),
  currentDesignation: z.string().trim().max(100).optional().or(z.literal('')),
  industry: z.string().trim().max(100).optional().or(z.literal('')),
  yearsOfExperience: z.coerce.number().min(0).max(60).optional(),
  city: z.string().trim().max(100).optional().or(z.literal('')),
  country: z.string().trim().max(100).optional().or(z.literal('')),
  bio: z.string().trim().max(2000, 'Bio cannot exceed 2000 characters').optional().or(z.literal('')),
  linkedinUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => !val || /^https?:\/\/(www\.)?linkedin\.com\/.*$/i.test(val) || /^linkedin\.com\/.*$/i.test(val) || /^[a-zA-Z0-9_-]+$/.test(val),
      'Please enter a valid LinkedIn URL or profile handle'
    ),
  isWillingToMentor: z.boolean().optional(),
  maxMentees: z.coerce.number().min(1).max(20).optional(),
  mentorshipTopics: z.string().trim().max(500).optional().or(z.literal('')),
  skills: z.union([z.array(z.string().trim()), z.string().trim()]).optional(),
});

// Schema for responding to student mentorship request
const mentorshipResponseSchema = z.object({
  action: z.enum(['ACCEPT', 'DECLINE'], { required_error: 'Action must be ACCEPT or DECLINE' }),
  responseNote: z.string().trim().max(1000).optional(),
  scheduledAt: z.string().datetime().optional().or(z.string().optional()),
  durationMinutes: z.coerce.number().min(15).max(180).default(45).optional(),
  meetingType: z.enum(['GOOGLE_MEET', 'ZOOM', 'IN_PERSON', 'CUSTOM_URL']).default('GOOGLE_MEET').optional(),
  meetingUrl: z.string().trim().url('Please enter a valid meeting URL').optional().or(z.literal('')),
});

const alumniAppealSchema = z.object({
  appealStatement: z
    .string({ required_error: 'Appeal statement is required' })
    .trim()
    .min(10, 'Appeal statement must be at least 10 characters')
    .max(2000, 'Appeal statement cannot exceed 2000 characters'),
  supplementalDocUrl: z.string().trim().url('Invalid document URL').optional().or(z.literal('')),
});

export class AlumniController {
  /**
   * GET /api/alumni/profile
   * Returns current alumni's verified profile, academic credentials and skills.
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
          alumniProfile: {
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

      if (!user || !user.alumniProfile) {
        throw new NotFoundError('Alumni profile not found');
      }

      return ApiResponse.success(res, {
        message: 'Alumni profile retrieved',
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
          profile: user.alumniProfile,
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
   * PUT /api/alumni/profile
   * Updates permitted alumni profile fields with strict ownership enforcement.
   * Modifying USN, department, degree, graduation year, role, status or isVerified is strictly prohibited.
   */
  static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const parsed = updateAlumniProfileSchema.parse(req.body);

      const currentProfile = await prisma.alumniProfile.findUnique({
        where: { userId: req.user.id },
      });

      if (!currentProfile) {
        throw new NotFoundError('Alumni profile not found');
      }

      // Execute update inside transaction
      const { updatedUser, updatedProfile } = await prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
          where: { id: req.user!.id },
          data: {
            fullName: parsed.fullName !== undefined ? parsed.fullName : undefined,
            phoneNumber: parsed.phoneNumber !== undefined ? (parsed.phoneNumber || null) : undefined,
          },
        });

        const profile = await tx.alumniProfile.update({
          where: { userId: req.user!.id },
          data: {
            currentCompany: parsed.currentCompany !== undefined ? (parsed.currentCompany || null) : undefined,
            currentDesignation: parsed.currentDesignation !== undefined ? (parsed.currentDesignation || null) : undefined,
            industry: parsed.industry !== undefined ? (parsed.industry || null) : undefined,
            yearsOfExperience: parsed.yearsOfExperience !== undefined ? parsed.yearsOfExperience : undefined,
            city: parsed.city !== undefined ? (parsed.city || null) : undefined,
            country: parsed.country !== undefined ? (parsed.country || null) : undefined,
            bio: parsed.bio !== undefined ? (parsed.bio || null) : undefined,
            linkedinUrl: parsed.linkedinUrl !== undefined ? (parsed.linkedinUrl || null) : undefined,
            isWillingToMentor: parsed.isWillingToMentor !== undefined ? parsed.isWillingToMentor : undefined,
            maxMentees: parsed.maxMentees !== undefined ? parsed.maxMentees : undefined,
            mentorshipTopics: parsed.mentorshipTopics !== undefined ? (parsed.mentorshipTopics || null) : undefined,
          },
        });

        // Update skills if provided
        if (parsed.skills !== undefined) {
          const skillNames: string[] = [];
          if (Array.isArray(parsed.skills)) {
            parsed.skills.forEach((s) => {
              if (typeof s === 'string' && s.trim().length > 0) skillNames.push(s.trim());
            });
          } else if (typeof parsed.skills === 'string' && parsed.skills.trim().length > 0) {
            parsed.skills.split(',').forEach((s) => {
              if (s.trim().length > 0) skillNames.push(s.trim());
            });
          }

          // Clear existing user skills and re-link
          await tx.userSkill.deleteMany({ where: { userId: req.user!.id } });
          for (const sName of skillNames.slice(0, 15)) {
            const slug = sName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const skill = await tx.skill.upsert({
              where: { slug },
              update: {},
              create: { name: sName, slug, category: 'General' },
            });
            await tx.userSkill.create({
              data: {
                userId: req.user!.id,
                skillId: skill.id,
                proficiency: 'ADVANCED',
              },
            });
          }
        }

        return { updatedUser: user, updatedProfile: profile };
      });

      return ApiResponse.success(res, {
        message: 'Alumni profile updated successfully',
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
   * GET /api/alumni/dashboard
   * Returns aggregated real database records for the alumni dashboard.
   */
  static async getDashboardSummary(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          alumniProfile: {
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

      if (!user || !user.alumniProfile) {
        throw new NotFoundError('Alumni profile not found');
      }

      const profile = user.alumniProfile;

      // Real counts from MySQL
      const [totalRequestsCount, activeMentorshipsCount, pendingRequestsCount, distinctStudentsCount, upcomingEventsCount, recentAnnouncements] =
        await Promise.all([
          prisma.mentorshipRequest.count({
            where: { alumniId: profile.id },
          }),
          prisma.mentorshipRequest.count({
            where: { alumniId: profile.id, status: MentorshipStatus.ACCEPTED },
          }),
          prisma.mentorshipRequest.count({
            where: { alumniId: profile.id, status: MentorshipStatus.PENDING },
          }),
          prisma.mentorshipRequest.groupBy({
            by: ['studentId'],
            where: { alumniId: profile.id, status: { in: [MentorshipStatus.ACCEPTED, MentorshipStatus.COMPLETED] } },
          }),
          prisma.campusEvent.count({
            where: { status: 'SCHEDULED' },
          }),
          prisma.announcement.findMany({
            where: {
              status: 'PUBLISHED',
              targetAudience: { in: ['ALL', 'ALUMNI_ONLY'] },
            },
            orderBy: { publishedAt: 'desc' },
            take: 4,
          }),
        ]);

      // Fetch recent inbound mentorship requests
      const recentRequests = await prisma.mentorshipRequest.findMany({
        where: { alumniId: profile.id },
        include: {
          student: {
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
        take: 5,
      });

      // Calculate real profile completion percentage
      const completionChecks = [
        !!user.fullName && user.fullName.trim().length > 0,
        !!profile.rollNumber,
        !!profile.department,
        !!profile.degree,
        !!profile.graduationYear,
        !!profile.currentCompany,
        !!profile.currentDesignation,
        !!profile.bio,
        !!profile.linkedinUrl,
        !!user.phoneNumber,
        !!(profile.city || profile.country),
        user.userSkills.length > 0,
      ];
      const completedCount = completionChecks.filter(Boolean).length;
      const profileCompletionPercentage = Math.round((completedCount / completionChecks.length) * 100);

      return ApiResponse.success(res, {
        message: 'Alumni dashboard summary retrieved',
        data: {
          alumni: {
            id: user.id,
            profileId: profile.id,
            fullName: user.fullName || 'Alumnus',
            email: user.email,
            phoneNumber: user.phoneNumber,
            avatarUrl: user.avatarUrl,
            status: user.status,
            isVerified: profile.isVerified,
            rollNumber: profile.rollNumber,
            collegeName: profile.collegeName,
            department: profile.department,
            degree: profile.degree,
            graduationYear: profile.graduationYear,
            currentCompany: profile.currentCompany,
            currentDesignation: profile.currentDesignation,
            industry: profile.industry,
            yearsOfExperience: profile.yearsOfExperience,
            city: profile.city,
            country: profile.country,
            bio: profile.bio,
            linkedinUrl: profile.linkedinUrl,
            isWillingToMentor: profile.isWillingToMentor,
            maxMentees: profile.maxMentees,
            mentorshipTopics: profile.mentorshipTopics,
            latestVerification: profile.verifications[0] || null,
          },
          metrics: {
            mentorshipRequestsReceived: totalRequestsCount,
            activeMentorships: activeMentorshipsCount,
            pendingRequestsCount,
            studentsMentoredCount: distinctStudentsCount.length,
            upcomingEventsCount,
            skillsCount: user.userSkills.length,
            profileCompletionPercentage,
          },
          recentRequests: recentRequests.map((r) => ({
            id: r.id,
            studentName: r.student.user.fullName || 'Student',
            studentRoll: r.student.rollNumber,
            studentDept: `${r.student.department} (${r.student.currentSemester ? `Semester ${r.student.currentSemester}` : 'Student'})`,
            studentAvatar: r.student.user.avatarUrl,
            studentEmail: r.student.user.email,
            topic: r.topic,
            message: r.reason,
            status: r.status,
            alumniResponseNote: r.alumniResponseNote,
            createdAt: r.createdAt,
            session: r.session
              ? {
                  scheduledAt: r.session.scheduledAt,
                  durationMinutes: r.session.durationMinutes,
                  meetingType: r.session.meetingType,
                  meetingUrl: r.session.meetingUrl,
                  status: r.session.status,
                }
              : null,
          })),
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
   * GET /api/alumni/verification-status
   * Returns alumni's actual verification state and sanitized notes from MySQL.
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
          alumniProfile: {
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

      if (!user || !user.alumniProfile) {
        throw new NotFoundError('Alumni profile not found');
      }

      const latestVerif = user.alumniProfile.verifications[0] || null;
      const latestAppeal = user.accountAppeals[0] || null;

      return ApiResponse.success(res, {
        message: 'Verification status retrieved',
        data: {
          accountStatus: user.status,
          isVerified: user.alumniProfile.isVerified,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          rollNumber: user.alumniProfile.rollNumber,
          collegeName: user.alumniProfile.collegeName,
          department: user.alumniProfile.department,
          degree: user.alumniProfile.degree,
          graduationYear: user.alumniProfile.graduationYear,
          currentCompany: user.alumniProfile.currentCompany,
          currentDesignation: user.alumniProfile.currentDesignation,
          industry: user.alumniProfile.industry,
          yearsOfExperience: user.alumniProfile.yearsOfExperience,
          city: user.alumniProfile.city,
          country: user.alumniProfile.country,
          bio: user.alumniProfile.bio,
          linkedinUrl: user.alumniProfile.linkedinUrl,
          isWillingToMentor: user.alumniProfile.isWillingToMentor,
          mentorshipTopics: user.alumniProfile.mentorshipTopics,
          verification: latestVerif
            ? {
                id: latestVerif.id,
                status: latestVerif.status,
                documentType: latestVerif.documentType,
                submissionNotes: latestVerif.submissionNotes,
                // Public review reason if rejected; never expose internal administrative notes
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
   * POST /api/alumni/verification-appeal
   * Allows rejected or suspended alumni to submit an appeal.
   */
  static async submitAppeal(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      if (req.user.status !== AccountStatus.REJECTED && req.user.status !== AccountStatus.SUSPENDED) {
        throw new BadRequestError('Appeals are only permitted for rejected or suspended accounts.');
      }

      const parsed = alumniAppealSchema.parse(req.body);

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
        message: 'Appeal submitted successfully. The Alumni Relations Office will review your statement.',
        data: { appeal: newAppeal },
      });
    } catch (err) {
      next(err);
      return;
    }
  }

  /**
   * GET /api/alumni/mentorship-requests
   * Gated: verified alumni only.
   * Returns list of mentorship requests received with student profile details and sessions.
   */
  static async getMentorshipRequests(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const profile = await prisma.alumniProfile.findUnique({
        where: { userId: req.user.id },
      });

      if (!profile) {
        throw new NotFoundError('Alumni profile not found');
      }

      const requests = await prisma.mentorshipRequest.findMany({
        where: { alumniId: profile.id },
        include: {
          student: {
            include: {
              user: {
                select: {
                  fullName: true,
                  avatarUrl: true,
                  email: true,
                  phoneNumber: true,
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
          requests: requests.map((r) => ({
            id: r.id,
            studentName: r.student.user.fullName || 'Student',
            studentRoll: r.student.rollNumber,
            studentDept: r.student.department,
            studentDegree: r.student.degree,
            studentSemester: r.student.currentSemester,
            studentAvatar: r.student.user.avatarUrl,
            studentEmail: r.student.user.email,
            studentPhone: r.student.user.phoneNumber,
            topic: r.topic,
            message: r.reason,
            status: r.status,
            alumniResponseNote: r.alumniResponseNote,
            createdAt: r.createdAt,
            session: r.session
              ? {
                  id: r.session.id,
                  scheduledAt: r.session.scheduledAt,
                  durationMinutes: r.session.durationMinutes,
                  meetingType: r.session.meetingType,
                  meetingUrl: r.session.meetingUrl,
                  status: r.session.status,
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

  /**
   * PATCH /api/alumni/mentorship-requests/:id
   * Gated: verified alumni only.
   * Accepts or declines a student mentorship request and optionally schedules a session.
   */
  static async respondToMentorshipRequest(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const requestId = req.params.id;
      const parsed = mentorshipResponseSchema.parse(req.body);

      const profile = await prisma.alumniProfile.findUnique({
        where: { userId: req.user.id },
      });

      if (!profile) {
        throw new NotFoundError('Alumni profile not found');
      }

      // Verify request exists and belongs to this alumni
      const request = await prisma.mentorshipRequest.findUnique({
        where: { id: requestId },
        include: { session: true },
      });

      if (!request) {
        throw new NotFoundError('Mentorship request not found');
      }

      if (request.alumniId !== profile.id) {
        throw new ForbiddenError('You can only respond to mentorship requests addressed to your profile');
      }

      const newStatus = parsed.action === 'ACCEPT' ? MentorshipStatus.ACCEPTED : MentorshipStatus.DECLINED;

      const updated = await prisma.$transaction(async (tx) => {
        const updatedReq = await tx.mentorshipRequest.update({
          where: { id: requestId },
          data: {
            status: newStatus,
            alumniResponseNote: parsed.responseNote || null,
          },
        });

        let session = null;
        if (parsed.action === 'ACCEPT') {
          const scheduledDate = parsed.scheduledAt ? new Date(parsed.scheduledAt) : new Date(Date.now() + 86400000 * 2);
          const meetingType = (parsed.meetingType as MeetingType) || MeetingType.GOOGLE_MEET;

          if (request.session) {
            session = await tx.mentorshipSession.update({
              where: { id: request.session.id },
              data: {
                scheduledAt: scheduledDate,
                durationMinutes: parsed.durationMinutes || 45,
                meetingType,
                meetingUrl: parsed.meetingUrl || 'https://meet.google.com/alm-connect-session',
                status: SessionStatus.SCHEDULED,
              },
            });
          } else {
            session = await tx.mentorshipSession.create({
              data: {
                requestId: request.id,
                scheduledAt: scheduledDate,
                durationMinutes: parsed.durationMinutes || 45,
                meetingType,
                meetingUrl: parsed.meetingUrl || 'https://meet.google.com/alm-connect-session',
                status: SessionStatus.SCHEDULED,
              },
            });
          }
        }

        return { request: updatedReq, session };
      });

      return ApiResponse.success(res, {
        message: `Mentorship request successfully ${parsed.action.toLowerCase()}ed.`,
        data: updated,
      });
    } catch (err) {
      next(err);
      return;
    }
  }

  /**
   * GET /api/alumni/announcements
   * Returns published announcements for alumni from MySQL.
   */
  static async getAnnouncements(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const announcements = await prisma.announcement.findMany({
        where: {
          status: 'PUBLISHED',
          targetAudience: { in: ['ALL', 'ALUMNI_ONLY'] },
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
}
