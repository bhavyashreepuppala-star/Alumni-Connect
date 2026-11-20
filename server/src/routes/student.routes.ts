import { Router, Request, Response } from 'express';
import { authenticate, requireRole, requireVerified } from '../middleware/auth.middleware';
import { StudentController } from '../controllers/student.controller';
import { ApiResponse } from '../utils/apiResponse';
import { UserRole } from '@prisma/client';
import { prisma } from '../config/database';

const router = Router();

// -------------------------------------------------------------
// STUDENT PROFILE & DASHBOARD (Accessible by all Student states)
// -------------------------------------------------------------
router.get('/profile', authenticate, requireRole(UserRole.STUDENT), StudentController.getProfile);
router.put('/profile', authenticate, requireRole(UserRole.STUDENT), StudentController.updateProfile);
router.get('/dashboard', authenticate, requireRole(UserRole.STUDENT), StudentController.getDashboardSummary);
router.get('/verification-status', authenticate, requireRole(UserRole.STUDENT), StudentController.getVerificationStatus);
router.post('/verification-appeal', authenticate, requireRole(UserRole.STUDENT), StudentController.submitAppeal);
router.get('/announcements', authenticate, requireRole(UserRole.STUDENT), StudentController.getAnnouncements);

// -------------------------------------------------------------
// PROTECTED NETWORKING APIS (Gated: VERIFIED Students Only)
// -------------------------------------------------------------
router.get(
  '/networking-access',
  authenticate,
  requireRole(UserRole.STUDENT),
  requireVerified,
  async (req: Request, res: Response) => {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });

    return ApiResponse.success(res, {
      message: 'Institutional networking access verified and active.',
      data: {
        accessGranted: true,
        user: req.user,
        profile: studentProfile,
        features: {
          requestMentorship: true,
          directMessaging: true,
          applyJobs: true,
          eventRegistration: true,
        },
      },
    });
  }
);

router.get(
  '/alumni-directory',
  authenticate,
  requireRole(UserRole.STUDENT),
  requireVerified,
  StudentController.getAlumniDirectory
);

router.get(
  '/mentorships',
  authenticate,
  requireRole(UserRole.STUDENT),
  requireVerified,
  StudentController.getMentorshipRequests
);

export const studentRoutes = router;
