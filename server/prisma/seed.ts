import { PrismaClient, UserRole, VerificationStatus, SkillLevel } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Alumni Connect database seed...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Seed Skills
  const skillsData = [
    { name: 'TypeScript', slug: 'typescript', category: 'Software Engineering' },
    { name: 'React', slug: 'react', category: 'Software Engineering' },
    { name: 'Node.js', slug: 'nodejs', category: 'Software Engineering' },
    { name: 'Python', slug: 'python', category: 'Data & AI' },
    { name: 'Machine Learning', slug: 'machine-learning', category: 'Data & AI' },
    { name: 'AWS Cloud Architecture', slug: 'aws-cloud', category: 'Cloud & DevOps' },
    { name: 'Docker & Kubernetes', slug: 'docker-kubernetes', category: 'Cloud & DevOps' },
    { name: 'System Design', slug: 'system-design', category: 'Software Engineering' },
    { name: 'Product Strategy', slug: 'product-strategy', category: 'Product & Management' },
    { name: 'UI/UX Design', slug: 'ui-ux-design', category: 'Design' },
    { name: 'Engineering Leadership', slug: 'engineering-leadership', category: 'Product & Management' },
  ];

  const createdSkills: Record<string, string> = {};
  for (const skill of skillsData) {
    const s = await prisma.skill.upsert({
      where: { slug: skill.slug },
      update: { category: skill.category, name: skill.name },
      create: skill,
    });
    createdSkills[skill.slug] = s.id;
  }
  console.log(`✅ Seeded ${skillsData.length} core skills.`);

  // 2. Seed Admin User
  const adminEmail = 'admin@alumniconnect.edu';
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: UserRole.ADMIN, isEmailVerified: true },
    create: {
      email: adminEmail,
      passwordHash,
      role: UserRole.ADMIN,
      isEmailVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      adminProfile: {
        create: {
          employeeId: 'ADM-2024-001',
          department: 'Office of Alumni Relations & Career Services',
          designation: 'Director of Institutional Engagement',
          permissions: 'SUPER_ADMIN,VERIFY_ALUMNI,MANAGE_COMMUNITY,REPORTS',
        },
      },
    },
    include: { adminProfile: true },
  });
  console.log(`✅ Seeded Admin: ${adminUser.email}`);

  // 3. Seed Verified Alumni User
  const alumniEmail = 'sarah.chen@alumni.edu';
  const alumniUser = await prisma.user.upsert({
    where: { email: alumniEmail },
    update: { role: UserRole.ALUMNI, isEmailVerified: true },
    create: {
      email: alumniEmail,
      passwordHash,
      role: UserRole.ALUMNI,
      isEmailVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      alumniProfile: {
        create: {
          graduationYear: 2018,
          degree: 'B.Tech Computer Science',
          department: 'Computer Science and Engineering',
          currentCompany: 'Google',
          currentDesignation: 'Staff Software Engineer',
          industry: 'Software & Technology',
          yearsOfExperience: 6,
          city: 'San Francisco, CA',
          country: 'United States',
          bio: 'Passionate about distributed systems, cloud infrastructure and mentoring first-generation college students navigating tech careers.',
          linkedinUrl: 'https://linkedin.com/in/sarahchen-demo',
          isWillingToMentor: true,
          mentorshipTopics: 'Distributed Systems, Big Tech Interviewing, Resume Reviews, Career Transitions',
          isVerified: true,
        },
      },
    },
    include: { alumniProfile: true },
  });

  if (alumniUser.alumniProfile && adminUser.adminProfile) {
    // Check if verification record exists
    const existingVerif = await prisma.alumniVerification.findFirst({
      where: { alumniProfileId: alumniUser.alumniProfile.id },
    });

    if (!existingVerif) {
      await prisma.alumniVerification.create({
        data: {
          alumniProfileId: alumniUser.alumniProfile.id,
          status: VerificationStatus.APPROVED,
          documentType: 'DEGREE_CERTIFICATE_VERIFIED',
          documentUrl: 'https://res.cloudinary.com/demo/image/upload/v1/sample-degree.pdf',
          submissionNotes: 'Class of 2018 B.Tech degree document submitted along with university transcript.',
          reviewNotes: 'Verified against university records office archive on batch 2018 CSE.',
          reviewedByAdminId: adminUser.adminProfile.id,
          reviewedAt: new Date(),
        },
      });
    }
  }
  console.log(`✅ Seeded Alumni: ${alumniUser.email} (Google Staff Engineer, Verified)`);

  // 4. Seed Student User
  const studentEmail = 'alex.rivera@student.edu';
  const studentUser = await prisma.user.upsert({
    where: { email: studentEmail },
    update: { role: UserRole.STUDENT, isEmailVerified: true },
    create: {
      email: studentEmail,
      passwordHash,
      role: UserRole.STUDENT,
      isEmailVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      studentProfile: {
        create: {
          rollNumber: 'CS2023-4089',
          department: 'Computer Science and Engineering',
          degree: 'B.Tech Computer Science',
          expectedGraduationYear: 2026,
          currentSemester: 6,
          cgpa: 3.88,
          bio: 'Junior CS student passionate about full-stack web development and scalable backends. Looking for summer 2026 SWE internships and mentorship in distributed systems.',
          headline: 'CS Junior @ University | Aspiring Full-Stack & Systems Engineer',
          githubUrl: 'https://github.com/alexrivera-demo',
          linkedinUrl: 'https://linkedin.com/in/alexrivera-demo',
          portfolioUrl: 'https://alexrivera.dev',
        },
      },
    },
    include: { studentProfile: true },
  });

  // Assign user skills for student
  const studentSkillSlugs = ['typescript', 'react', 'nodejs', 'system-design'];
  for (const slug of studentSkillSlugs) {
    const skillId = createdSkills[slug];
    if (skillId) {
      await prisma.userSkill.upsert({
        where: {
          userId_skillId: {
            userId: studentUser.id,
            skillId,
          },
        },
        update: {},
        create: {
          userId: studentUser.id,
          skillId,
          proficiency: SkillLevel.INTERMEDIATE,
          endorsementsCount: 3,
        },
      });
    }
  }
  console.log(`✅ Seeded Student: ${studentUser.email} with skills.`);

  console.log('✨ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
