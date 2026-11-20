import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Student-specific registration endpoint
router.post('/register/student', AuthController.registerStudent);

// Universal / legacy registration endpoint
router.post('/register', AuthController.register);

// Authentication & Session
router.post('/login', AuthController.login);
router.get('/me', authenticate, AuthController.getMe);

// Developer / Demo Accounts
router.get('/demo-accounts', AuthController.getDemoAccounts);

export const authRoutes = router;
