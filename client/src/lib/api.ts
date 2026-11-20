export interface HealthResponse {
  status: 'ok' | 'degraded';
  service: string;
  version: string;
  environment: string;
  timestamp: string;
  services: {
    backend: {
      status: 'up' | 'down';
      uptimeSeconds: number;
      nodeVersion: string;
      memory: {
        rss: string;
        heapTotal: string;
        heapUsed: string;
      };
    };
    database: {
      dialect: string;
      status: 'up' | 'down';
      latencyMs: number;
      message: string;
    };
  };
}

export interface DemoAccount {
  role: 'STUDENT' | 'ALUMNI' | 'ADMIN';
  email: string;
  password: string;
  description: string;
}

export interface StudentRegistrationPayload {
  fullName: string;
  email: string;
  rollNumber: string;
  department: string;
  degree: string;
  currentSemester: number;
  expectedGraduationYear: number;
  phoneNumber?: string;
  password: string;
  confirmPassword: string;
}

export interface StudentRegistrationResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      fullName: string;
      phoneNumber?: string | null;
      role: string;
      status: string;
      isEmailVerified: boolean;
      createdAt: string;
    };
    profile: {
      id: string;
      rollNumber: string;
      department: string;
      degree: string;
      currentSemester: number;
      expectedGraduationYear: number;
      isVerified: boolean;
    };
    verification: {
      id: string;
      status: string;
      verificationMethod: string;
      usnClaimed: string;
    };
  };
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id: string;
      email: string;
      fullName?: string | null;
      phoneNumber?: string | null;
      role: 'STUDENT' | 'ALUMNI' | 'ADMIN';
      status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
      isEmailVerified: boolean;
      profile?: any;
    };
  };
}

export interface StudentProfileData {
  user: {
    id: string;
    email: string;
    fullName: string;
    phoneNumber?: string | null;
    role: string;
    status: string;
    isEmailVerified: boolean;
    avatarUrl?: string | null;
    createdAt: string;
  };
  profile: {
    id: string;
    userId: string;
    rollNumber: string;
    department: string;
    degree: string;
    expectedGraduationYear: number;
    currentSemester?: number | null;
    cgpa?: number | null;
    bio?: string | null;
    headline?: string | null;
    resumeUrl?: string | null;
    portfolioUrl?: string | null;
    githubUrl?: string | null;
    linkedinUrl?: string | null;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
    verifications?: Array<{
      id: string;
      status: string;
      verificationMethod: string;
      usnClaimed: string;
      submissionNotes?: string | null;
      reviewNotes?: string | null;
      reviewedAt?: string | null;
      createdAt: string;
    }>;
  };
  skills: Array<{
    id: string;
    name: string;
    category: string;
    proficiency: string;
    endorsementsCount: number;
  }>;
}

export interface StudentDashboardData {
  student: {
    id: string;
    profileId: string;
    fullName: string;
    email: string;
    phoneNumber?: string | null;
    avatarUrl?: string | null;
    status: string;
    isVerified: boolean;
    rollNumber: string;
    department: string;
    degree: string;
    currentSemester?: number | null;
    expectedGraduationYear: number;
    cgpa?: number | null;
    bio?: string | null;
    headline?: string | null;
    githubUrl?: string | null;
    linkedinUrl?: string | null;
    portfolioUrl?: string | null;
    latestVerification?: {
      id: string;
      status: string;
      verificationMethod: string;
      usnClaimed: string;
      submissionNotes?: string | null;
      reviewNotes?: string | null;
      createdAt: string;
    } | null;
  };
  metrics: {
    mentorshipRequestsCount: number;
    savedJobsCount: number;
    upcomingEventsCount: number;
    skillsCount: number;
    profileCompletionPercentage: number;
  };
  announcements: Array<{
    id: string;
    title: string;
    category: string;
    content: string;
    priority: string;
    publishedAt: string;
  }>;
}

export interface VerificationStatusData {
  accountStatus: 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
  isVerified: boolean;
  fullName?: string | null;
  email: string;
  phoneNumber?: string | null;
  rollNumber: string;
  department: string;
  degree: string;
  currentSemester?: number | null;
  expectedGraduationYear: number;
  bio?: string | null;
  headline?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  verification?: {
    id: string;
    status: string;
    verificationMethod: string;
    usnClaimed: string;
    submissionNotes?: string | null;
    publicReviewReason?: string | null;
    createdAt: string;
  } | null;
  appeal?: {
    id: string;
    status: string;
    appealStatement: string;
    verdict?: string | null;
    createdAt: string;
  } | null;
}

export interface AlumniDirectoryItem {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl?: string | null;
  degree: string;
  department: string;
  graduationYear: number;
  currentCompany?: string | null;
  currentDesignation?: string | null;
  industry?: string | null;
  yearsOfExperience: number;
  city?: string | null;
  country?: string | null;
  bio?: string | null;
  linkedinUrl?: string | null;
  isWillingToMentor: boolean;
  maxMentees: number;
  mentorshipTopics?: string | null;
}

export interface MentorshipItem {
  id: string;
  topic: string;
  reason: string;
  status: string;
  alumniResponseNote?: string | null;
  createdAt: string;
  alumni: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    company?: string | null;
    designation?: string | null;
  };
  session?: {
    scheduledAt: string;
    durationMinutes: number;
    meetingType: string;
    meetingUrl?: string | null;
    status: string;
  } | null;
}

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('alumni_connect_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const api = {
  getToken(): string | null {
    return localStorage.getItem('alumni_connect_token');
  },

  getCurrentUser(): any {
    try {
      const u = localStorage.getItem('alumni_connect_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem('alumni_connect_token');
    localStorage.removeItem('alumni_connect_user');
  },

  async getHealth(): Promise<HealthResponse> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok && res.status !== 503) {
      throw new Error(`Health check failed with status: ${res.status}`);
    }
    return res.json();
  },

  async getDemoAccounts(): Promise<DemoAccount[]> {
    const res = await fetch(`${API_BASE}/auth/demo-accounts`);
    const json = await res.json();
    return json.data;
  },

  async getLinkedInStatus(): Promise<{ configured: boolean; scopes: string[] }> {
    const res = await fetch(`${API_BASE}/linkedin/status`);
    const json = await res.json();
    return json.data;
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.message || 'Authentication failed. Please verify your credentials.');
    }

    if (json.data?.token) {
      localStorage.setItem('alumni_connect_token', json.data.token);
      localStorage.setItem('alumni_connect_user', JSON.stringify(json.data.user));
    }

    return json;
  },

  async registerStudent(payload: StudentRegistrationPayload): Promise<StudentRegistrationResponse> {
    const res = await fetch(`${API_BASE}/auth/register/student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (!res.ok) {
      const errorMsg =
        json.errors && Array.isArray(json.errors) && json.errors.length > 0
          ? json.errors.map((e: { message?: string }) => e.message || '').filter(Boolean).join('; ')
          : json.message || 'Registration failed';
      throw new Error(errorMsg);
    }

    return json;
  },

  async getStudentProfile(): Promise<StudentProfileData> {
    const res = await fetch(`${API_BASE}/student/profile`, {
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to fetch student profile');
    }
    return json.data;
  },

  async updateStudentProfile(payload: {
    fullName?: string;
    phoneNumber?: string;
    headline?: string;
    bio?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    cgpa?: number;
    currentSemester?: number;
  }): Promise<{ user: any; profile: any }> {
    const res = await fetch(`${API_BASE}/student/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      const errorMsg =
        json.errors && Array.isArray(json.errors) && json.errors.length > 0
          ? json.errors.map((e: { message?: string }) => e.message || '').filter(Boolean).join('; ')
          : json.message || 'Failed to update profile';
      throw new Error(errorMsg);
    }
    return json.data;
  },

  async getStudentDashboard(): Promise<StudentDashboardData> {
    const res = await fetch(`${API_BASE}/student/dashboard`, {
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to fetch dashboard summary');
    }
    return json.data;
  },

  async getStudentVerificationStatus(): Promise<VerificationStatusData> {
    const res = await fetch(`${API_BASE}/student/verification-status`, {
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to fetch verification status');
    }
    return json.data;
  },

  async submitVerificationAppeal(statement: string, supplementalDocUrl?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/student/verification-appeal`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ appealStatement: statement, supplementalDocUrl }),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to submit verification appeal');
    }
    return json.data;
  },

  async getAlumniDirectory(): Promise<AlumniDirectoryItem[]> {
    const res = await fetch(`${API_BASE}/student/alumni-directory`, {
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to fetch alumni directory');
    }
    return json.data.alumni;
  },

  async getAnnouncements(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/student/announcements`, {
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to fetch announcements');
    }
    return json.data.announcements;
  },

  async getMentorshipRequests(): Promise<MentorshipItem[]> {
    const res = await fetch(`${API_BASE}/student/mentorships`, {
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to fetch mentorship requests');
    }
    return json.data.mentorships;
  },
};
