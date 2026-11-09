import { Router, Request, Response } from 'express';
import { LinkedInService } from '../services/linkedin.service';
import { ApiResponse } from '../utils/apiResponse';
import { env } from '../config/env';

const router = Router();

// GET /api/linkedin/status
router.get('/status', (req: Request, res: Response) => {
  const isConfigured = Boolean(env.LINKEDIN_CLIENT_ID && env.LINKEDIN_CLIENT_SECRET);
  return ApiResponse.success(res, {
    message: isConfigured
      ? 'LinkedIn OAuth 2.0 / OpenID Connect is configured'
      : 'LinkedIn OAuth 2.0 is pending credentials in .env',
    data: {
      configured: isConfigured,
      scopes: ['openid', 'profile', 'email', 'w_member_social'],
      redirectUri: env.LINKEDIN_REDIRECT_URI,
    },
  });
});

// GET /api/linkedin/auth-url
router.get('/auth-url', (req: Request, res: Response) => {
  const state = LinkedInService.generateState();
  const authUrl = LinkedInService.getAuthorizationUrl(state);

  return ApiResponse.success(res, {
    message: 'Generated LinkedIn OAuth 2.0 authorization URL',
    data: {
      authUrl,
      state,
      scopes: ['openid', 'profile', 'email', 'w_member_social'],
    },
  });
});

export const linkedinRoutes = router;
