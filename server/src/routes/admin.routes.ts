import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// Strictly enforce authentication & ADMIN role for all routes in this router
router.use(authenticate);
router.use(requireRole(UserRole.ADMIN));

// Overview Dashboard
router.get('/dashboard/summary', AdminController.getDashboardSummary);

// Student Verification & Directory
router.get('/students', AdminController.getStudents);
router.get('/students/:id', AdminController.getStudentById);
router.post('/students/:id/verify', AdminController.reviewStudentVerification);

// Alumni Verification & Directory
router.get('/alumni', AdminController.getAlumni);
router.get('/alumni/:id', AdminController.getAlumniById);
router.post('/alumni/:id/verify', AdminController.reviewAlumniVerification);

// User Moderation (Suspend / Reinstate)
router.post('/users/:userId/suspend', AdminController.suspendUser);
router.post('/users/:userId/reinstate', AdminController.reinstateUser);

// Appeals Management
router.get('/appeals', AdminController.getAppeals);
router.post('/appeals/:appealId/resolve', AdminController.resolveAppeal);

// Announcements Management
router.get('/announcements', AdminController.getAnnouncements);
router.post('/announcements', AdminController.createAnnouncement);
router.put('/announcements/:id', AdminController.updateAnnouncement);
router.patch('/announcements/:id/status', AdminController.toggleAnnouncementStatus);
router.delete('/announcements/:id', AdminController.deleteAnnouncement);

// Audit Logs (Read-only)
router.get('/audit-logs', AdminController.getAuditLogs);

export { router as adminRoutes };
