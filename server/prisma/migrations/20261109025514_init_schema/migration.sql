-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `role` ENUM('STUDENT', 'ALUMNI', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
    `isEmailVerified` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `avatarUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_role_idx`(`role`),
    INDEX `User_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StudentProfile` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `rollNumber` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NOT NULL,
    `degree` VARCHAR(191) NOT NULL DEFAULT 'B.Tech',
    `expectedGraduationYear` INTEGER NOT NULL,
    `currentSemester` INTEGER NULL,
    `cgpa` DOUBLE NULL,
    `bio` TEXT NULL,
    `headline` VARCHAR(191) NULL,
    `resumeUrl` VARCHAR(191) NULL,
    `portfolioUrl` VARCHAR(191) NULL,
    `githubUrl` VARCHAR(191) NULL,
    `linkedinUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `StudentProfile_userId_key`(`userId`),
    UNIQUE INDEX `StudentProfile_rollNumber_key`(`rollNumber`),
    INDEX `StudentProfile_department_idx`(`department`),
    INDEX `StudentProfile_expectedGraduationYear_idx`(`expectedGraduationYear`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AlumniProfile` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `graduationYear` INTEGER NOT NULL,
    `degree` VARCHAR(191) NOT NULL DEFAULT 'B.Tech',
    `department` VARCHAR(191) NOT NULL,
    `currentCompany` VARCHAR(191) NULL,
    `currentDesignation` VARCHAR(191) NULL,
    `industry` VARCHAR(191) NULL,
    `yearsOfExperience` INTEGER NOT NULL DEFAULT 0,
    `city` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `bio` TEXT NULL,
    `linkedinUrl` VARCHAR(191) NULL,
    `isWillingToMentor` BOOLEAN NOT NULL DEFAULT true,
    `mentorshipTopics` VARCHAR(191) NULL,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AlumniProfile_userId_key`(`userId`),
    INDEX `AlumniProfile_currentCompany_idx`(`currentCompany`),
    INDEX `AlumniProfile_industry_idx`(`industry`),
    INDEX `AlumniProfile_graduationYear_idx`(`graduationYear`),
    INDEX `AlumniProfile_isVerified_idx`(`isVerified`),
    INDEX `AlumniProfile_isWillingToMentor_idx`(`isWillingToMentor`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdminProfile` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NOT NULL,
    `designation` VARCHAR(191) NOT NULL,
    `permissions` VARCHAR(191) NULL DEFAULT 'VERIFY_ALUMNI,MANAGE_USERS,VIEW_ANALYTICS',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AdminProfile_userId_key`(`userId`),
    UNIQUE INDEX `AdminProfile_employeeId_key`(`employeeId`),
    INDEX `AdminProfile_department_idx`(`department`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LinkedAccount` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `provider` ENUM('LINKEDIN', 'GOOGLE', 'GITHUB') NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `profileUrl` VARCHAR(191) NULL,
    `accessToken` TEXT NULL,
    `refreshToken` TEXT NULL,
    `expiresAt` DATETIME(3) NULL,
    `scope` VARCHAR(191) NULL,
    `rawProfile` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `LinkedAccount_userId_idx`(`userId`),
    UNIQUE INDEX `LinkedAccount_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AlumniVerification` (
    `id` VARCHAR(191) NOT NULL,
    `alumniProfileId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `documentType` VARCHAR(191) NOT NULL,
    `documentUrl` VARCHAR(191) NOT NULL,
    `submissionNotes` TEXT NULL,
    `reviewNotes` TEXT NULL,
    `reviewedByAdminId` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AlumniVerification_alumniProfileId_idx`(`alumniProfileId`),
    INDEX `AlumniVerification_status_idx`(`status`),
    INDEX `AlumniVerification_reviewedByAdminId_idx`(`reviewedByAdminId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Skill` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Skill_name_key`(`name`),
    UNIQUE INDEX `Skill_slug_key`(`slug`),
    INDEX `Skill_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserSkill` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `skillId` VARCHAR(191) NOT NULL,
    `proficiency` ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT') NOT NULL DEFAULT 'INTERMEDIATE',
    `endorsementsCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `UserSkill_userId_idx`(`userId`),
    INDEX `UserSkill_skillId_idx`(`skillId`),
    UNIQUE INDEX `UserSkill_userId_skillId_key`(`userId`, `skillId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StudentProfile` ADD CONSTRAINT `StudentProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AlumniProfile` ADD CONSTRAINT `AlumniProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdminProfile` ADD CONSTRAINT `AdminProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LinkedAccount` ADD CONSTRAINT `LinkedAccount_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AlumniVerification` ADD CONSTRAINT `AlumniVerification_alumniProfileId_fkey` FOREIGN KEY (`alumniProfileId`) REFERENCES `AlumniProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AlumniVerification` ADD CONSTRAINT `AlumniVerification_reviewedByAdminId_fkey` FOREIGN KEY (`reviewedByAdminId`) REFERENCES `AdminProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserSkill` ADD CONSTRAINT `UserSkill_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserSkill` ADD CONSTRAINT `UserSkill_skillId_fkey` FOREIGN KEY (`skillId`) REFERENCES `Skill`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
