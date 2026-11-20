/**
 * auth.ts — Thin, synchronous auth utilities for the Alumni Connect frontend.
 * No Context / Provider needed: components call these helpers directly.
 * Token is stored in localStorage as a plain Bearer token (architecture matches Phase 1).
 * Security note: localStorage is acceptable for development; for production a
 * short-lived HttpOnly cookie with a refresh-token rotation scheme is preferred.
 */

const TOKEN_KEY = 'alumni_connect_token';
const USER_KEY = 'alumni_connect_user';

export type StoredUser = {
  id: string;
  email: string;
  fullName?: string | null;
  role: 'STUDENT' | 'ALUMNI' | 'ADMIN';
  status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
  isEmailVerified: boolean;
};

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function clearSession(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // ignore
  }
}
