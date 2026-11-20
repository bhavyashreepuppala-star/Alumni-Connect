import { app } from './src/app';
import { prisma } from './src/config/database';
import bcrypt from 'bcryptjs';
import http from 'http';
import { UserRole, AccountStatus } from '@prisma/client';

const PORT = 5099;
const BASE_URL = `http://localhost:${PORT}/api`;

async function runTests() {
  console.log('====================================================');
  console.log('🧪 ALUMNI CONNECT: STUDENT REGISTRATION TEST SUITE');
  console.log('====================================================\n');

  // Start HTTP server on test port
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(PORT, resolve));
  console.log(`🚀 Test server listening on http://localhost:${PORT}\n`);

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    totalTests++;
    if (condition) {
      console.log(`✅ [TEST ${totalTests}] PASS: ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [TEST ${totalTests}] FAIL: ${testName}`);
      if (details) console.error(`   Details: ${details}`);
    }
  }

  const testEmail = 'priya.sharma@student.edu';
  const testUSN = '1MS21CS099';

  try {
    // 0. Clean any pre-existing test data
    const existing = await prisma.user.findUnique({ where: { email: testEmail } });
    if (existing) {
      await prisma.user.delete({ where: { id: existing.id } });
    }

    // TEST 1: Valid student registration succeeds
    const validStudentPayload = {
      fullName: 'Priya Sharma',
      email: testEmail,
      rollNumber: testUSN,
      department: 'Computer Science and Engineering',
      degree: 'B.Tech',
      currentSemester: 6,
      expectedGraduationYear: 2026,
      phoneNumber: '+91 98765 43210',
      password: 'StrongPassword123!@',
      confirmPassword: 'StrongPassword123!@',
    };

    const regRes = await fetch(`${BASE_URL}/auth/register/student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validStudentPayload),
    });
    const regData = await regRes.json();

    assert(
      regRes.status === 201 && regData.success === true,
      'Valid student registration succeeds with HTTP 201',
      `Status: ${regRes.status}, Body: ${JSON.stringify(regData)}`
    );

    // TEST 2: The User record is created in MySQL
    const userInDb = await prisma.user.findUnique({
      where: { email: testEmail },
    });
    assert(
      !!userInDb && userInDb.email === testEmail && userInDb.fullName === 'Priya Sharma',
      'User record created in MySQL with matching email and full name',
      `Found user: ${JSON.stringify(userInDb)}`
    );

    // TEST 3: The StudentProfile and StudentVerification records are created correctly
    const profileInDb = await prisma.studentProfile.findUnique({
      where: { rollNumber: testUSN },
      include: { verifications: true },
    });
    assert(
      !!profileInDb &&
        profileInDb.userId === userInDb?.id &&
        profileInDb.department === 'Computer Science and Engineering' &&
        profileInDb.isVerified === false &&
        profileInDb.verifications.length > 0 &&
        profileInDb.verifications[0].status === 'PENDING',
      'StudentProfile record and pending StudentVerification record created in MySQL',
      `Profile: ${JSON.stringify(profileInDb)}`
    );

    // TEST 4: Password is stored as a bcrypt hash (not plaintext)
    const isBcrypt =
      !!userInDb?.passwordHash &&
      userInDb.passwordHash.startsWith('$2') &&
      userInDb.passwordHash !== validStudentPayload.password;
    const bcryptMatches = await bcrypt.compare(validStudentPayload.password, userInDb!.passwordHash);
    assert(
      isBcrypt && bcryptMatches,
      'Password is securely stored as a bcrypt hash and never plaintext',
      `Hash: ${userInDb?.passwordHash}`
    );

    // TEST 5: Duplicate email is rejected
    const dupEmailRes = await fetch(`${BASE_URL}/auth/register/student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...validStudentPayload,
        rollNumber: '1MS21CS100', // Different USN, same email
      }),
    });
    const dupEmailData = await dupEmailRes.json();
    assert(
      dupEmailRes.status === 409 && dupEmailData.message.includes('email'),
      'Duplicate email is rejected with HTTP 409 Conflict',
      `Status: ${dupEmailRes.status}, Message: ${dupEmailData.message}`
    );

    // TEST 6: Duplicate USN is rejected
    const dupUSNRes = await fetch(`${BASE_URL}/auth/register/student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...validStudentPayload,
        email: 'priya.different@student.edu', // Different email, same USN
      }),
    });
    const dupUSNData = await dupUSNRes.json();
    assert(
      dupUSNRes.status === 409 && dupUSNData.message.includes('USN'),
      'Duplicate USN is rejected with HTTP 409 Conflict',
      `Status: ${dupUSNRes.status}, Message: ${dupUSNData.message}`
    );

    // TEST 7: Invalid email format is rejected
    const invalidEmailRes = await fetch(`${BASE_URL}/auth/register/student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...validStudentPayload,
        email: 'invalid-email-format',
        rollNumber: '1MS21CS101',
      }),
    });
    const invalidEmailData = await invalidEmailRes.json();
    assert(
      invalidEmailRes.status === 400,
      'Invalid email format is rejected with HTTP 400 Bad Request',
      `Status: ${invalidEmailRes.status}, Errors: ${JSON.stringify(invalidEmailData)}`
    );

    // TEST 8: Weak passwords are rejected (e.g. no uppercase, number, or symbol)
    const weakPassRes = await fetch(`${BASE_URL}/auth/register/student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...validStudentPayload,
        email: 'priya.weak@student.edu',
        rollNumber: '1MS21CS102',
        password: 'password123',
        confirmPassword: 'password123',
      }),
    });
    assert(
      weakPassRes.status === 400,
      'Weak password (missing uppercase/special symbol) is rejected with HTTP 400',
      `Status: ${weakPassRes.status}`
    );

    // TEST 9: Password mismatch is rejected
    const mismatchRes = await fetch(`${BASE_URL}/auth/register/student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...validStudentPayload,
        email: 'priya.mismatch@student.edu',
        rollNumber: '1MS21CS103',
        password: 'StrongPassword123!@',
        confirmPassword: 'DifferentPassword123!@',
      }),
    });
    assert(
      mismatchRes.status === 400,
      'Password mismatch is rejected with HTTP 400 Bad Request',
      `Status: ${mismatchRes.status}`
    );

    // TEST 10: Role cannot be manipulated via registration payload
    const injectRoleRes = await fetch(`${BASE_URL}/auth/register/student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...validStudentPayload,
        email: 'priya.admin.attempt@student.edu',
        rollNumber: '1MS21CS104',
        role: 'ADMIN', // Injection attempt
      }),
    });
    const injectRoleData = await injectRoleRes.json();
    const createdUser = await prisma.user.findUnique({
      where: { email: 'priya.admin.attempt@student.edu' },
    });
    assert(
      createdUser?.role === UserRole.STUDENT,
      'Role cannot be manipulated through registration request (server enforces STUDENT role)',
      `Actual assigned role: ${createdUser?.role}`
    );
    if (createdUser) {
      await prisma.user.delete({ where: { id: createdUser.id } });
    }

    // TEST 11: Verification status cannot be manipulated via registration payload
    const injectStatusRes = await fetch(`${BASE_URL}/auth/register/student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...validStudentPayload,
        email: 'priya.verify.attempt@student.edu',
        rollNumber: '1MS21CS105',
        status: 'VERIFIED', // Injection attempt
        isVerified: true, // Injection attempt
      }),
    });
    const injectStatusUser = await prisma.user.findUnique({
      where: { email: 'priya.verify.attempt@student.edu' },
      include: { studentProfile: true },
    });
    assert(
      injectStatusUser?.status === AccountStatus.PENDING_VERIFICATION &&
        injectStatusUser?.studentProfile?.isVerified === false,
      'Verification status cannot be manipulated through registration request (server enforces PENDING_VERIFICATION)',
      `User status: ${injectStatusUser?.status}, Profile isVerified: ${injectStatusUser?.studentProfile?.isVerified}`
    );
    if (injectStatusUser) {
      await prisma.user.delete({ where: { id: injectStatusUser.id } });
    }

    // TEST 12: Pending students cannot access protected student networking APIs
    // A) Login with pending student account
    const pendingLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'StrongPassword123!@',
      }),
    });
    const pendingLoginData = await pendingLoginRes.json();
    const pendingToken = pendingLoginData.data?.token;

    // B) Attempt to access protected networking API
    const protectedAccessRes = await fetch(`${BASE_URL}/student/networking-access`, {
      headers: { Authorization: `Bearer ${pendingToken}` },
    });
    const protectedAccessData = await protectedAccessRes.json();

    assert(
      protectedAccessRes.status === 403 &&
        protectedAccessData.message.includes('pending institutional verification'),
      'Pending students cannot access protected networking APIs (HTTP 403 Forbidden enforced by backend middleware)',
      `Status: ${protectedAccessRes.status}, Message: ${protectedAccessData.message}`
    );

    // C) Contrast with verified student (alex.rivera@student.edu)
    const verifiedLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alex.rivera@student.edu',
        password: 'Password123!',
      }),
    });
    const verifiedLoginData = await verifiedLoginRes.json();
    const verifiedToken = verifiedLoginData.data?.token;

    const verifiedAccessRes = await fetch(`${BASE_URL}/student/networking-access`, {
      headers: { Authorization: `Bearer ${verifiedToken}` },
    });
    const verifiedAccessData = await verifiedAccessRes.json();

    assert(
      verifiedAccessRes.status === 200 && verifiedAccessData.data?.accessGranted === true,
      'Verified student successfully accesses protected networking APIs (HTTP 200 OK)',
      `Status: ${verifiedAccessRes.status}`
    );

    // TEST 13: Existing login functionality still works across all 3 roles
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@alumniconnect.edu', password: 'Password123!' }),
    });
    const alumniLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'sarah.chen@alumni.edu', password: 'Password123!' }),
    });
    const demoAccountsRes = await fetch(`${BASE_URL}/auth/demo-accounts`);

    assert(
      adminLoginRes.status === 200 && alumniLoginRes.status === 200 && demoAccountsRes.status === 200,
      'Existing login for Admin, Alumni, and Demo accounts works without regression',
      `Admin: ${adminLoginRes.status}, Alumni: ${alumniLoginRes.status}`
    );

    // Clean up created test student
    const cleanupUser = await prisma.user.findUnique({ where: { email: testEmail } });
    if (cleanupUser) {
      await prisma.user.delete({ where: { id: cleanupUser.id } });
      console.log(`\n🧹 Cleaned up test user record: ${testEmail}`);
    }

    console.log('\n====================================================');
    console.log(`🏁 TEST RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
    console.log('====================================================\n');
  } catch (err) {
    console.error('Fatal test runner error:', err);
  } finally {
    server.close();
    await prisma.$disconnect();
  }
}

runTests();

