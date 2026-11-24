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

export interface AlumniRegistrationPayload {
  fullName: string;
  email: string;
  phoneNumber?: string;
  password: string;
  confirmPassword: string;
  rollNumber: string;
  collegeName?: string;
  department: string;
  graduationYear: number;
  degree: string;
  currentCompany?: string;
  currentDesignation?: string;
  industry?: string;
  yearsOfExperience?: number;
  city?: string;
  country?: string;
  linkedinUrl?: string;
  skills?: string[] | string;
  bio?: string;
  mentorshipTopics?: string;
  isWillingToMentor?: boolean;
  maxMentees?: number;
}

export interface AlumniRegistrationResponse {
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
      rollNumber?: string | null;
      collegeName?: string | null;
      department: string;
      degree: string;
      graduationYear: number;
      currentCompany?: string | null;
      currentDesignation?: string | null;
      industry?: string | null;
      yearsOfExperience: number;
      city?: string | null;
      country?: string | null;
      isWillingToMentor: boolean;
      maxMentees: number;
      mentorshipTopics?: string | null;
      isVerified: boolean;
    };
    verification: {
      id: string;
      status: string;
      documentType: string;
    };
  };
}

export interface AlumniDashboardData {
  alumni: {
    id: string;
    profileId: string;
    fullName: string;
    email: string;
    phoneNumber?: string | null;
    avatarUrl?: string | null;
    status: string;
    isVerified: boolean;
    rollNumber?: string | null;
    collegeName?: string | null;
    department: string;
    degree: string;
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
    latestVerification?: {
      id: string;
      status: string;
      documentType: string;
      submissionNotes?: string | null;
      createdAt: string;
    } | null;
  };
  metrics: {
    mentorshipRequestsReceived: number;
    activeMentorships: number;
    pendingRequestsCount: number;
    studentsMentoredCount: number;
    upcomingEventsCount: number;
    skillsCount: number;
    profileCompletionPercentage: number;
  };
  recentRequests: Array<{
    id: string;
    studentName: string;
    studentRoll: string;
    studentDept: string;
    studentAvatar?: string | null;
    studentEmail: string;
    topic: string;
    message: string;
    status: string;
    alumniResponseNote?: string | null;
    createdAt: string;
    session?: {
      scheduledAt: string;
      durationMinutes: number;
      meetingType: string;
      meetingUrl?: string | null;
      status: string;
    } | null;
  }>;
  announcements: Array<{
    id: string;
    title: string;
    category: string;
    content: string;
    priority: string;
    publishedAt: string;
  }>;
}

export interface AlumniVerificationStatusData {
  accountStatus: 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
  isVerified: boolean;
  fullName?: string | null;
  email: string;
  phoneNumber?: string | null;
  rollNumber?: string | null;
  collegeName?: string | null;
  department: string;
  degree: string;
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
  mentorshipTopics?: string | null;
  verification?: {
    id: string;
    status: string;
    documentType: string;
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

export interface AlumniMentorshipRequestItem {
  id: string;
  studentName: string;
  studentRoll: string;
  studentDept: string;
  studentDegree: string;
  studentSemester?: number | null;
  studentAvatar?: string | null;
  studentEmail: string;
  studentPhone?: string | null;
  topic: string;
  message: string;
  status: string;
  alumniResponseNote?: string | null;
  createdAt: string;
  session?: {
    id: string;
    scheduledAt: string;
    durationMinutes: number;
    meetingType: string;
    meetingUrl?: string | null;
    status: string;
  } | null;
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

  // -------------------------------------------------------------
  // ALUMNI MODULE METHODS (PHASE 3)
  // -------------------------------------------------------------
  async registerAlumni(payload: AlumniRegistrationPayload): Promise<AlumniRegistrationResponse> {
    const res = await fetch(`${API_BASE}/auth/register/alumni`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (!res.ok) {
      const errorMsg =
        json.errors && Array.isArray(json.errors) && json.errors.length > 0
          ? json.errors.map((e: { message?: string }) => e.message || '').filter(Boolean).join('; ')
          : json.message || 'Alumni registration failed';
      throw new Error(errorMsg);
    }

    return json;
  },

  async getAlumniProfile(): Promise<any> {
    const res = await fetch(`${API_BASE}/alumni/profile`, {
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to fetch alumni profile');
    }
    return json.data;
  },

  async updateAlumniProfile(payload: {
    fullName?: string;
    phoneNumber?: string;
    currentCompany?: string;
    currentDesignation?: string;
    industry?: string;
    yearsOfExperience?: number;
    city?: string;
    country?: string;
    bio?: string;
    linkedinUrl?: string;
    isWillingToMentor?: boolean;
    maxMentees?: number;
    mentorshipTopics?: string;
    skills?: string[] | string;
  }): Promise<{ user: any; profile: any }> {
    const res = await fetch(`${API_BASE}/alumni/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      const errorMsg =
        json.errors && Array.isArray(json.errors) && json.errors.length > 0
          ? json.errors.map((e: { message?: string }) => e.message || '').filter(Boolean).join('; ')
          : json.message || 'Failed to update alumni profile';
      throw new Error(errorMsg);
    }
    return json.data;
  },

  async getAlumniDashboard(): Promise<AlumniDashboardData> {
    const res = await fetch(`${API_BASE}/alumni/dashboard`, {
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to fetch alumni dashboard summary');
    }
    return json.data;
  },

  async getAlumniVerificationStatus(): Promise<AlumniVerificationStatusData> {
    const res = await fetch(`${API_BASE}/alumni/verification-status`, {
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to fetch alumni verification status');
    }
    return json.data;
  },

  async submitAlumniVerificationAppeal(statement: string, supplementalDocUrl?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/alumni/verification-appeal`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ appealStatement: statement, supplementalDocUrl }),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to submit alumni verification appeal');
    }
    return json.data;
  },

  async getAlumniMentorshipRequests(): Promise<AlumniMentorshipRequestItem[]> {
    const res = await fetch(`${API_BASE}/alumni/mentorship-requests`, {
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to fetch mentorship requests');
    }
    return json.data.requests;
  },

  async respondToMentorshipRequest(
    requestId: string,
    payload: {
      action: 'ACCEPT' | 'DECLINE';
      responseNote?: string;
      scheduledAt?: string;
      durationMinutes?: number;
      meetingType?: string;
      meetingUrl?: string;
    }
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/alumni/mentorship-requests/${requestId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to respond to mentorship request');
    }
    return json.data;
  },

  async getAlumniAnnouncements(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/alumni/announcements`, {
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to fetch announcements');
    }
    return json.data.announcements;
  },

  // -----------------------------------------------------------
  // ADMIN / CDC APIs
  // -----------------------------------------------------------
  async getAdminDashboardSummary(): Promise<AdminDashboardSummaryData> {
    const res = await fetch(`${API_BASE}/admin/dashboard/summary`, {
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to fetch admin dashboard summary');
    }
    return json.data;
  },

  async getAdminStudents(params?: {
    search?: string;
    status?: string;
    department?: string;
    page?: number;
    limit?: number;
  }): Promise<{ students: AdminStudentItem[]; pagination: any }> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.department) query.append('department', params.department);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const res = await fetch(`${API_BASE}/admin/students?${query.toString()}`, {
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to fetch students list');
    }
    return json.data;
  },

  async getAdminStudentById(id: string): Promise<AdminStudentItem> {
    const res = await fetch(`${API_BASE}/admin/students/${id}`, {
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to fetch student details');
    }
    return json.data.student;
  },

  async reviewAdminStudentVerification(
    id: string,
    payload: { decision: 'APPROVE' | 'REJECT'; reason?: string }
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/students/${id}/verify`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to review student verification');
    }
    return json.data;
  },

  async getAdminAlumni(params?: {
    search?: string;
    status?: string;
    department?: string;
    company?: string;
    page?: number;
    limit?: number;
  }): Promise<{ alumni: AdminAlumniItem[]; pagination: any }> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.department) query.append('department', params.department);
    if (params?.company) query.append('company', params.company);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const res = await fetch(`${API_BASE}/admin/alumni?${query.toString()}`, {
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to fetch alumni list');
    }
    return json.data;
  },

  async getAdminAlumniById(id: string): Promise<AdminAlumniItem> {
    const res = await fetch(`${API_BASE}/admin/alumni/${id}`, {
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to fetch alumni details');
    }
    return json.data.alumni;
  },

  async reviewAdminAlumniVerification(
    id: string,
    payload: { decision: 'APPROVE' | 'REJECT'; reason?: string }
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/alumni/${id}/verify`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to review alumni verification');
    }
    return json.data;
  },

  async suspendUser(userId: string, reason: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/suspend`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to suspend account');
    }
    return json.data;
  },

  async reinstateUser(userId: string, reason: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/reinstate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to reinstate account');
    }
    return json.data;
  },

  async getAdminAppeals(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ appeals: AdminAppealItem[]; pagination: any }> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const res = await fetch(`${API_BASE}/admin/appeals?${query.toString()}`, {
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to fetch appeals');
    }
    return json.data;
  },

  async resolveAdminAppeal(
    appealId: string,
    payload: { decision: 'APPROVE' | 'REJECT'; resolutionVerdict: string }
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/appeals/${appealId}/resolve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to resolve appeal');
    }
    return json.data;
  },

  async getAdminAnnouncements(): Promise<AdminAnnouncementItem[]> {
    const res = await fetch(`${API_BASE}/admin/announcements`, {
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to fetch announcements');
    }
    return json.data.announcements;
  },

  async createAdminAnnouncement(payload: {
    title: string;
    category: string;
    content: string;
    targetAudience: string;
    targetDepartment?: string | null;
    targetBatchYear?: number | null;
    priority?: string;
    status?: string;
    attachmentUrl?: string | null;
  }): Promise<AdminAnnouncementItem> {
    const res = await fetch(`${API_BASE}/admin/announcements`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to create announcement');
    }
    return json.data.announcement;
  },

  async updateAdminAnnouncement(
    id: string,
    payload: Partial<{
      title: string;
      category: string;
      content: string;
      targetAudience: string;
      targetDepartment?: string | null;
      targetBatchYear?: number | null;
      priority?: string;
      status?: string;
      attachmentUrl?: string | null;
    }>
  ): Promise<AdminAnnouncementItem> {
    const res = await fetch(`${API_BASE}/admin/announcements/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to update announcement');
    }
    return json.data.announcement;
  },

  async toggleAdminAnnouncementStatus(
    id: string,
    status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'
  ): Promise<AdminAnnouncementItem> {
    const res = await fetch(`${API_BASE}/admin/announcements/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to update announcement status');
    }
    return json.data.announcement;
  },

  async deleteAdminAnnouncement(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/announcements/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to delete announcement');
    }
  },

  async getAdminAuditLogs(params?: {
    search?: string;
    action?: string;
    targetType?: string;
    page?: number;
    limit?: number;
  }): Promise<{ logs: AdminAuditLogItem[]; pagination: any }> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.action) query.append('action', params.action);
    if (params?.targetType) query.append('targetType', params.targetType);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const res = await fetch(`${API_BASE}/admin/audit-logs?${query.toString()}`, {
      headers: getAuthHeaders(),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Failed to fetch audit logs');
    }
    return json.data;
  },
};

// -------------------------------------------------------------
// ADMIN INTERFACES
// -------------------------------------------------------------
export interface AdminDashboardSummaryData {
  admin: {
    name: string;
    email: string;
    employeeId: string;
    department: string;
    designation: string;
  };
  metrics: {
    totalStudents: number;
    totalAlumni: number;
    pendingStudents: number;
    pendingAlumni: number;
    totalPendingVerifications: number;
    verifiedUsers: number;
    rejectedUsers: number;
    suspendedUsers: number;
    pendingAppeals: number;
    totalAnnouncements: number;
  };
  departmentDistribution: Array<{
    department: string;
    studentCount: number;
  }>;
  recentAuditLogs: Array<{
    id: string;
    action: string;
    targetType: string;
    targetId: string;
    reason: string;
    performedBy: string;
    createdAt: string;
  }>;
}

export interface AdminStudentItem {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string | null;
  status: string;
  isActive: boolean;
  avatarUrl?: string | null;
  createdAt: string;
  studentProfile?: {
    id: string;
    rollNumber: string;
    department: string;
    degree: string;
    currentSemester?: number | null;
    expectedGraduationYear: number;
    cgpa?: number | null;
    bio?: string | null;
    headline?: string | null;
    linkedinUrl?: string | null;
    githubUrl?: string | null;
    portfolioUrl?: string | null;
    resumeUrl?: string | null;
    isVerified: boolean;
    verifications?: any[];
  } | null;
  accountAppeals?: any[];
}

export interface AdminAlumniItem {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string | null;
  status: string;
  isActive: boolean;
  avatarUrl?: string | null;
  createdAt: string;
  alumniProfile?: {
    id: string;
    rollNumber?: string | null;
    collegeName?: string | null;
    currentCompany?: string | null;
    currentDesignation?: string | null;
    industry?: string | null;
    yearsOfExperience?: number;
    city?: string | null;
    country?: string | null;
    bio?: string | null;
    linkedinUrl?: string | null;
    isWillingToMentor?: boolean;
    maxMentees?: number;
    mentorshipTopics?: string | null;
    graduationYear: number;
    degree: string;
    department: string;
    isVerified: boolean;
    verifications?: any[];
  } | null;
  accountAppeals?: any[];
}

export interface AdminAnnouncementItem {
  id: string;
  authorAdminId: string;
  title: string;
  category: string;
  content: string;
  targetAudience: string;
  targetDepartment?: string | null;
  targetBatchYear?: number | null;
  priority: string;
  attachmentUrl?: string | null;
  publishedAt: string;
  expiresAt?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  authorAdmin?: {
    employeeId: string;
    department: string;
    designation: string;
    user: {
      fullName: string;
      email: string;
    };
  };
}

export interface AdminAppealItem {
  id: string;
  userId: string;
  actionAppealed: string;
  appealStatement: string;
  supplementalDocUrl?: string | null;
  status: string;
  resolutionVerdict?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    status: string;
    phoneNumber?: string | null;
  };
  reviewedByAdmin?: {
    employeeId: string;
    user: { fullName: string; email: string };
  } | null;
}

export interface AdminAuditLogItem {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  reason: string;
  previousState?: string | null;
  newState?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  admin: {
    id: string;
    employeeId: string;
    name: string | null;
    email: string;
    department: string;
  };
}
