import { prisma } from './src/config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from './src/config/env';
import { app } from './src/app';
import { Server } from 'http';

async function runPhase3TestSuite() {
  console.log('===========================================================');
  console.log('🧪 RUNNING ALUMNI CONNECT PHASE 3 AUTOMATED TEST SUITE');
  console.log('===========================================================\n');

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failedTests++;
    }
  }

  // Start HTTP server on dynamic port
  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  async function req(path: string, options: { method?: string; body?: any; token?: string } = {}) {
    const headers: Record<string, string> = {};
    if (options.body) {
      headers['Content-Type'] = 'application/json';
    }
    if (options.token) {
      headers['Authorization'] = `Bearer ${options.token}`;
    }
    const res = await fetch(`${baseUrl}${path}`, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    let body: any = null;
    try {
      body = await res.json();
    } catch {}
    return { status: res.status, body };
  }

  const timestamp = Date.now();
  const testAlumniEmail = `rajesh.kumar.${timestamp}@alumni.test.edu`;
  const testUSN = `ALM-${timestamp}`;
  const validPassword = 'SecurePassword123!';

  try {
    // -------------------------------------------------------------
    // TEST 1: Valid Alumni Registration
    // -------------------------------------------------------------
    console.log('\n--- 1. Alumni Registration Tests ---');
    const regRes = await req('/api/auth/register/alumni', {
      method: 'POST',
      body: {
        fullName: 'Rajesh Kumar',
        email: testAlumniEmail,
        phoneNumber: '+91 9876543210',
        password: validPassword,
        confirmPassword: validPassword,
        rollNumber: testUSN,
        collegeName: 'Alumni Connect University',
        department: 'Computer Science and Engineering',
        degree: 'B.Tech',
        graduationYear: 2020,
        currentCompany: 'Amazon Web Services',
        currentDesignation: 'Senior Cloud Solutions Architect',
        industry: 'Software & Cloud Computing',
        yearsOfExperience: 4,
        city: 'Bengaluru',
        country: 'India',
        linkedinUrl: 'https://linkedin.com/in/rajesh-kumar-demo',
        skills: ['AWS', 'Distributed Systems', 'Java', 'Docker'],
        bio: 'Passionate about mentoring young engineers and cloud architecture.',
        mentorshipTopics: 'Cloud Architecture, AWS Certifications, Career Progression',
        isWillingToMentor: true,
        maxMentees: 3,
      },
    });

    assert(
      regRes.status === 201 && regRes.body?.success === true,
      'Valid alumni registration creates account with HTTP 201',
      `Status: ${regRes.status}, Body: ${JSON.stringify(regRes.body)}`
    );

    assert(
      regRes.body?.data?.user?.role === 'ALUMNI' &&
      regRes.body?.data?.user?.status === 'PENDING_VERIFICATION',
      'New alumni account assigned ALUMNI role and PENDING_VERIFICATION status on server'
    );

    assert(
      regRes.body?.data?.profile?.rollNumber === testUSN &&
      regRes.body?.data?.profile?.currentCompany === 'Amazon Web Services',
      'Alumni profile record created with company and USN credentials'
    );

    // Verify record in database
    const dbAlumni = await prisma.user.findUnique({
      where: { email: testAlumniEmail },
      include: { alumniProfile: { include: { verifications: true } }, userSkills: true },
    });

    assert(
      !!dbAlumni &&
      dbAlumni.alumniProfile?.isVerified === false &&
      dbAlumni.alumniProfile?.verifications.length === 1 &&
      dbAlumni.alumniProfile?.verifications[0].status === 'PENDING',
      'Database verifies user, unverified profile, and pending verification audit record'
    );

    assert(
      !('passwordHash' in (regRes.body?.data?.user || {})),
      'Password hash is never exposed in registration API response'
    );

    // -------------------------------------------------------------
    // TEST 2: Duplicate Email & USN Detection
    // -------------------------------------------------------------
    console.log('\n--- 2. Duplicate Detection Tests ---');
    const dupEmailRes = await req('/api/auth/register/alumni', {
      method: 'POST',
      body: {
        fullName: 'Another Person',
        email: testAlumniEmail, // duplicate
        password: validPassword,
        confirmPassword: validPassword,
        rollNumber: `ALM-DIFF-${timestamp}`,
        department: 'Mechanical Engineering',
        degree: 'B.Tech',
        graduationYear: 2019,
      },
    });

    assert(
      dupEmailRes.status === 409,
      'Duplicate email registration is rejected with HTTP 409 Conflict',
      `Got status: ${dupEmailRes.status}`
    );

    const dupUSNRes = await req('/api/auth/register/alumni', {
      method: 'POST',
      body: {
        fullName: 'Different Person',
        email: `different.${timestamp}@alumni.test.edu`,
        password: validPassword,
        confirmPassword: validPassword,
        rollNumber: testUSN, // duplicate USN
        department: 'Civil Engineering',
        degree: 'B.Tech',
        graduationYear: 2019,
      },
    });

    assert(
      dupUSNRes.status === 409,
      'Duplicate USN registration is rejected with HTTP 409 Conflict',
      `Got status: ${dupUSNRes.status}`
    );

    // -------------------------------------------------------------
    // TEST 3: Input Validation Tests
    // -------------------------------------------------------------
    console.log('\n--- 3. Validation & Security Tests ---');
    const weakPassRes = await req('/api/auth/register/alumni', {
      method: 'POST',
      body: {
        fullName: 'Test User',
        email: `valid.${timestamp}@alumni.test.edu`,
        password: 'weak', // weak password
        confirmPassword: 'weak',
        rollNumber: `ALM-WEAK-${timestamp}`,
        department: 'Computer Science and Engineering',
        degree: 'B.Tech',
        graduationYear: 2021,
      },
    });

    assert(
      weakPassRes.status === 400,
      'Weak password rejected with HTTP 400 Validation Error'
    );

    const mismatchPassRes = await req('/api/auth/register/alumni', {
      method: 'POST',
      body: {
        fullName: 'Test User',
        email: `valid2.${timestamp}@alumni.test.edu`,
        password: 'ValidPassword123!',
        confirmPassword: 'DifferentPassword123!',
        rollNumber: `ALM-MIS-${timestamp}`,
        department: 'Computer Science and Engineering',
        degree: 'B.Tech',
        graduationYear: 2021,
      },
    });

    assert(
      mismatchPassRes.status === 400,
      'Mismatched password confirmation rejected with HTTP 400'
    );

    // -------------------------------------------------------------
    // TEST 4: Alumni Login
    // -------------------------------------------------------------
    console.log('\n--- 4. Alumni Login Tests ---');
    const loginRes = await req('/api/auth/login', {
      method: 'POST',
      body: {
        email: testAlumniEmail,
        password: validPassword,
      },
    });

    assert(
      loginRes.status === 200 && !!loginRes.body?.data?.token,
      'Registered alumni logs in successfully and receives JWT token'
    );

    const pendingToken = loginRes.body?.data?.token;

    assert(
      loginRes.body?.data?.user?.role === 'ALUMNI' &&
      loginRes.body?.data?.user?.status === 'PENDING_VERIFICATION',
      'Login response identifies user role as ALUMNI with status PENDING_VERIFICATION'
    );

    // Also test verified alumni (Sarah Chen from seed)
    const sarahLoginRes = await req('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'sarah.chen@alumni.edu',
        password: 'Password123!',
      },
    });

    assert(
      sarahLoginRes.status === 200 &&
      sarahLoginRes.body?.data?.user?.role === 'ALUMNI' &&
      sarahLoginRes.body?.data?.user?.status === 'VERIFIED',
      'Verified seed alumni (Sarah Chen) logs in with status VERIFIED'
    );

    const verifiedAlumniToken = sarahLoginRes.body?.data?.token;

    // -------------------------------------------------------------
    // TEST 5: Verification Status Endpoint
    // -------------------------------------------------------------
    console.log('\n--- 5. Verification Status & Gating Tests ---');
    const statusRes = await req('/api/alumni/verification-status', {
      method: 'GET',
      token: pendingToken,
    });

    assert(
      statusRes.status === 200 &&
      statusRes.body?.data?.accountStatus === 'PENDING_VERIFICATION' &&
      statusRes.body?.data?.isVerified === false,
      'Pending alumni retrieves verification status with PENDING_VERIFICATION'
    );

    // Unauthenticated request blocked
    const unauthStatusRes = await req('/api/alumni/verification-status');
    assert(
      unauthStatusRes.status === 401,
      'Unauthenticated request to verification-status is rejected with HTTP 401'
    );

    // Pending alumni blocked from protected mentorship endpoints
    const pendingMentorshipRes = await req('/api/alumni/mentorship-requests', {
      method: 'GET',
      token: pendingToken,
    });

    assert(
      pendingMentorshipRes.status === 403,
      'Unverified alumni blocked from protected mentorship queue with HTTP 403 Forbidden'
    );

    // Verified alumni allowed to access mentorship queue
    const verifiedMentorshipRes = await req('/api/alumni/mentorship-requests', {
      method: 'GET',
      token: verifiedAlumniToken,
    });

    assert(
      verifiedMentorshipRes.status === 200 && Array.isArray(verifiedMentorshipRes.body?.data?.requests),
      'Verified alumni successfully accesses protected mentorship requests with HTTP 200'
    );

    // -------------------------------------------------------------
    // TEST 6: Role-Based Cross-Access Enforcement
    // -------------------------------------------------------------
    console.log('\n--- 6. Cross-Role Access Control Tests ---');
    const studentLoginRes = await req('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'alex.rivera@student.edu',
        password: 'Password123!',
      },
    });
    const studentToken = studentLoginRes.body?.data?.token;

    // Student attempting to access Alumni dashboard
    const studentAccessAlumniDash = await req('/api/alumni/dashboard', {
      method: 'GET',
      token: studentToken,
    });

    assert(
      studentAccessAlumniDash.status === 403,
      'Student user blocked from accessing Alumni dashboard API with HTTP 403'
    );

    // Alumni attempting to access Student dashboard
    const alumniAccessStudentDash = await req('/api/student/dashboard', {
      method: 'GET',
      token: verifiedAlumniToken,
    });

    assert(
      alumniAccessStudentDash.status === 403,
      'Alumni user blocked from accessing Student dashboard API with HTTP 403'
    );

    // -------------------------------------------------------------
    // TEST 7: Alumni Profile Updates
    // -------------------------------------------------------------
    console.log('\n--- 7. Profile Update & Ownership Tests ---');
    const updateRes = await req('/api/alumni/profile', {
      method: 'PUT',
      token: verifiedAlumniToken,
      body: {
        currentDesignation: 'Principal Staff Engineer',
        currentCompany: 'Google DeepMind',
        city: 'Mountain View, CA',
        bio: 'Updated bio for institutional testing.',
        mentorshipTopics: 'AI Research, Distributed Systems, Tech Leadership',
        isWillingToMentor: true,
        maxMentees: 4,
      },
    });

    assert(
      updateRes.status === 200 &&
      updateRes.body?.data?.profile?.currentDesignation === 'Principal Staff Engineer' &&
      updateRes.body?.data?.profile?.currentCompany === 'Google DeepMind',
      'Verified alumni updates permitted professional fields successfully'
    );

    // -------------------------------------------------------------
    // TEST 8: Alumni Dashboard Summary
    // -------------------------------------------------------------
    console.log('\n--- 8. Alumni Dashboard Summary Tests ---');
    const dashRes = await req('/api/alumni/dashboard', {
      method: 'GET',
      token: verifiedAlumniToken,
    });

    assert(
      dashRes.status === 200 &&
      dashRes.body?.data?.alumni?.fullName === 'Sarah Chen' &&
      typeof dashRes.body?.data?.metrics?.profileCompletionPercentage === 'number' &&
      Array.isArray(dashRes.body?.data?.recentRequests) &&
      Array.isArray(dashRes.body?.data?.announcements),
      'Alumni dashboard summary returns authentic metrics, requests, and announcements'
    );

    console.log('\n===========================================================');
    console.log(`📊 PHASE 3 TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log('===========================================================');

    if (failedTests > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Unhandled error during Phase 3 test run:', error);
    process.exit(1);
  } finally {
    server.close();
    await prisma.$disconnect();
  }
}

runPhase3TestSuite();
