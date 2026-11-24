import { Router } from 'express';
import { authenticate, requireRole, requireVerified } from '../middleware/auth.middleware';
import { AlumniController } from '../controllers/alumni.controller';
import { UserRole } from '@prisma/client';

const router = Router();

// -------------------------------------------------------------
// ALUMNI PROFILE & DASHBOARD (Accessible by all Alumni states)
// -------------------------------------------------------------
router.get('/profile', authenticate, requireRole(UserRole.ALUMNI), AlumniController.getProfile);
router.put('/profile', authenticate, requireRole(UserRole.ALUMNI), AlumniController.updateProfile);
router.get('/dashboard', authenticate, requireRole(UserRole.ALUMNI), AlumniController.getDashboardSummary);
router.get('/verification-status', authenticate, requireRole(UserRole.ALUMNI), AlumniController.getVerificationStatus);
router.post('/verification-appeal', authenticate, requireRole(UserRole.ALUMNI), AlumniController.submitAppeal);
router.get('/announcements', authenticate, requireRole(UserRole.ALUMNI), AlumniController.getAnnouncements);

// -------------------------------------------------------------
// PROTECTED MENTORSHIP & NETWORKING APIS (Gated: VERIFIED Alumni Only)
// -------------------------------------------------------------
router.get(
  '/mentorship-requests',
  authenticate,
  requireRole(UserRole.ALUMNI),
  requireVerified,
  AlumniController.getMentorshipRequests
);

router.patch(
  '/mentorship-requests/:id',
  authenticate,
  requireRole(UserRole.ALUMNI),
  requireVerified,
  AlumniController.respondToMentorshipRequest
);

export const alumniRoutes = router;
