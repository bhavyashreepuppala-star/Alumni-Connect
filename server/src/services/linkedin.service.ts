import { env } from '../config/env';
import crypto from 'crypto';

/**
 * LinkedIn Official OAuth 2.0 & OpenID Connect Architecture Service
 * Compliant with LinkedIn Developer Platform terms (no scraping, valid standard scopes).
 */
export interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  scope: string;
  token_type: string;
  id_token?: string;
}

export interface LinkedInUserInfo {
  sub: string; // OpenID subject (unique member identifier)
  name: string;
  given_name: string;
  family_name: string;
  picture?: string;
  email?: string;
  email_verified?: boolean;
  locale?: {
    country: string;
    language: string;
  };
}

export class LinkedInService {
  private static readonly AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
  private static readonly TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
  private static readonly USERINFO_URL = 'https://api.linkedin.com/v2/userinfo';

  /**
   * Official LinkedIn standard scopes:
   * - openid: Primary OpenID Connect identity assertion
   * - profile: Member's name and avatar picture
   * - email: Member's primary email address
   * - w_member_social: Authorized sharing on behalf of authenticated member
   */
  private static readonly DEFAULT_SCOPES = ['openid', 'profile', 'email', 'w_member_social'];

  /**
   * Generates a cryptographically secure random state parameter for CSRF mitigation
   */
  static generateState(): string {
    return crypto.randomBytes(24).toString('hex');
  }

  /**
   * Builds the official LinkedIn OAuth 2.0 Authorization Code flow URL
   */
  static getAuthorizationUrl(state: string, redirectUri?: string): string {
    const clientId = env.LINKEDIN_CLIENT_ID || 'PENDING_LINKEDIN_CLIENT_ID';
    const callback = redirectUri || env.LINKEDIN_REDIRECT_URI;
    const scopeParam = encodeURIComponent(this.DEFAULT_SCOPES.join(' '));

    return `${this.AUTH_URL}?response_type=code&client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(callback)}&state=${encodeURIComponent(
      state
    )}&scope=${scopeParam}`;
  }

  /**
   * Exchanges authorization code for OAuth 2.0 bearer access token
   */
  static async exchangeCodeForToken(
    code: string,
    redirectUri?: string
  ): Promise<LinkedInTokenResponse> {
    const callback = redirectUri || env.LINKEDIN_REDIRECT_URI;

    const bodyParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: env.LINKEDIN_CLIENT_ID,
      client_secret: env.LINKEDIN_CLIENT_SECRET,
      redirect_uri: callback,
    });

    const response = await fetch(this.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyParams.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LinkedIn token exchange failed: ${response.status} - ${errorText}`);
    }

    return (await response.json()) as LinkedInTokenResponse;
  }

  /**
   * Fetches authenticated member profile using LinkedIn OpenID Connect /userinfo
   */
  static async fetchUserInfo(accessToken: string): Promise<LinkedInUserInfo> {
    const response = await fetch(this.USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LinkedIn userinfo request failed: ${response.status} - ${errorText}`);
    }

    return (await response.json()) as LinkedInUserInfo;
  }

  /**
   * Architecture details for authorized post sharing (w_member_social)
   * e.g. An alumnus posting a student referral announcement
   */
  static getPostingEndpointSpec() {
    return {
      endpoint: 'https://api.linkedin.com/rest/posts',
      headers: {
        'LinkedIn-Version': '202401',
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json',
      },
      authorPrefix: 'urn:li:person:',
    };
  }
}
