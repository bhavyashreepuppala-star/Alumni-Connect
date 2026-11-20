-- AlterTable
ALTER TABLE `alumniprofile` ADD COLUMN `maxMentees` INTEGER NOT NULL DEFAULT 2;

-- AlterTable
ALTER TABLE `studentprofile` ADD COLUMN `isVerified` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `fullName` VARCHAR(191) NULL,
    ADD COLUMN `phoneNumber` VARCHAR(191) NULL,
    ADD COLUMN `status` ENUM('PENDING_VERIFICATION', 'VERIFIED', 'REJECTED', 'SUSPENDED') NOT NULL DEFAULT 'PENDING_VERIFICATION';

-- CreateTable
CREATE TABLE `StudentVerification` (
    `id` VARCHAR(191) NOT NULL,
    `studentProfileId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `verificationMethod` ENUM('COLLEGE_EMAIL_OTP', 'COLLEGE_ID_CARD', 'ADMISSION_ORDER', 'REGISTRAR_DATABASE_MATCH') NOT NULL DEFAULT 'COLLEGE_ID_CARD',
    `documentUrl` VARCHAR(191) NULL,
    `usnClaimed` VARCHAR(191) NOT NULL,
    `submissionNotes` TEXT NULL,
    `reviewNotes` TEXT NULL,
    `reviewedByAdminId` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `StudentVerification_studentProfileId_idx`(`studentProfileId`),
    INDEX `StudentVerification_status_idx`(`status`),
    INDEX `StudentVerification_reviewedByAdminId_idx`(`reviewedByAdminId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SuspiciousProfileReport` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `suspicionScore` INTEGER NOT NULL DEFAULT 0,
    `anomalyFlags` VARCHAR(191) NOT NULL,
    `evidenceMetadata` TEXT NULL,
    `status` ENUM('FLAGGED', 'INVESTIGATING', 'DISMISSED', 'ACTION_TAKEN') NOT NULL DEFAULT 'FLAGGED',
    `investigatedByAdminId` VARCHAR(191) NULL,
    `investigationNotes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SuspiciousProfileReport_userId_idx`(`userId`),
    INDEX `SuspiciousProfileReport_status_idx`(`status`),
    INDEX `SuspiciousProfileReport_investigatedByAdminId_idx`(`investigatedByAdminId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserReport` (
    `id` VARCHAR(191) NOT NULL,
    `reporterId` VARCHAR(191) NOT NULL,
    `reportedUserId` VARCHAR(191) NOT NULL,
    `category` ENUM('HARASSMENT', 'SPAM', 'FAKE_PROFILE', 'IMPERSONATION', 'INAPPROPRIATE_CONTENT', 'OTHER') NOT NULL,
    `description` TEXT NOT NULL,
    `evidenceUrl` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'UNDER_INVESTIGATION', 'ACTION_TAKEN', 'DISMISSED') NOT NULL DEFAULT 'PENDING',
    `resolvedByAdminId` VARCHAR(191) NULL,
    `resolutionNotes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `UserReport_reporterId_idx`(`reporterId`),
    INDEX `UserReport_reportedUserId_idx`(`reportedUserId`),
    INDEX `UserReport_status_idx`(`status`),
    INDEX `UserReport_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccountAppeal` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `actionAppealed` ENUM('VERIFICATION_REJECTION', 'ACCOUNT_SUSPENSION') NOT NULL,
    `appealStatement` TEXT NOT NULL,
    `supplementalDocUrl` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `reviewedByAdminId` VARCHAR(191) NULL,
    `resolutionVerdict` TEXT NULL,
    `reviewedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AccountAppeal_userId_idx`(`userId`),
    INDEX `AccountAppeal_status_idx`(`status`),
    INDEX `AccountAppeal_actionAppealed_idx`(`actionAppealed`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdminAuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `adminId` VARCHAR(191) NOT NULL,
    `action` ENUM('USER_APPROVE', 'USER_REJECT', 'USER_SUSPEND', 'USER_REINSTATE', 'POST_DELETE', 'JOB_MODERATE', 'EVENT_CANCEL', 'ANNOUNCEMENT_PUBLISH', 'APPEAL_RESOLVE') NOT NULL,
    `targetType` VARCHAR(191) NOT NULL,
    `targetId` VARCHAR(191) NOT NULL,
    `reason` TEXT NOT NULL,
    `previousState` TEXT NULL,
    `newState` TEXT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AdminAuditLog_adminId_idx`(`adminId`),
    INDEX `AdminAuditLog_action_idx`(`action`),
    INDEX `AdminAuditLog_targetType_targetId_idx`(`targetType`, `targetId`),
    INDEX `AdminAuditLog_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MentorshipRequest` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `alumniId` VARCHAR(191) NOT NULL,
    `topic` VARCHAR(191) NOT NULL,
    `reason` TEXT NOT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    `alumniResponseNote` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `MentorshipRequest_studentId_idx`(`studentId`),
    INDEX `MentorshipRequest_alumniId_idx`(`alumniId`),
    INDEX `MentorshipRequest_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MentorshipSession` (
    `id` VARCHAR(191) NOT NULL,
    `requestId` VARCHAR(191) NOT NULL,
    `scheduledAt` DATETIME(3) NOT NULL,
    `durationMinutes` INTEGER NOT NULL DEFAULT 45,
    `meetingType` ENUM('GOOGLE_MEET', 'ZOOM', 'IN_PERSON', 'CUSTOM_URL') NOT NULL DEFAULT 'GOOGLE_MEET',
    `meetingUrl` VARCHAR(191) NULL,
    `status` ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'RESCHEDULED', 'NO_SHOW', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    `studentNotes` TEXT NULL,
    `alumniNotes` TEXT NULL,
    `studentFeedback` TEXT NULL,
    `alumniFeedback` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MentorshipSession_requestId_key`(`requestId`),
    INDEX `MentorshipSession_scheduledAt_idx`(`scheduledAt`),
    INDEX `MentorshipSession_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MessageRequest` (
    `id` VARCHAR(191) NOT NULL,
    `senderId` VARCHAR(191) NOT NULL,
    `receiverId` VARCHAR(191) NOT NULL,
    `introduction` TEXT NOT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'DECLINED') NOT NULL DEFAULT 'PENDING',
    `respondedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `MessageRequest_senderId_idx`(`senderId`),
    INDEX `MessageRequest_receiverId_idx`(`receiverId`),
    INDEX `MessageRequest_status_idx`(`status`),
    UNIQUE INDEX `MessageRequest_senderId_receiverId_key`(`senderId`, `receiverId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Conversation` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('DIRECT_MENTORSHIP', 'PEER_DIRECT', 'ADMIN_SUPPORT') NOT NULL DEFAULT 'DIRECT_MENTORSHIP',
    `lastMessageAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Conversation_lastMessageAt_idx`(`lastMessageAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ConversationParticipant` (
    `id` VARCHAR(191) NOT NULL,
    `conversationId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `lastReadAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ConversationParticipant_conversationId_idx`(`conversationId`),
    INDEX `ConversationParticipant_userId_idx`(`userId`),
    UNIQUE INDEX `ConversationParticipant_conversationId_userId_key`(`conversationId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DirectMessage` (
    `id` VARCHAR(191) NOT NULL,
    `conversationId` VARCHAR(191) NOT NULL,
    `senderId` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `attachmentUrl` VARCHAR(191) NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `DirectMessage_conversationId_idx`(`conversationId`),
    INDEX `DirectMessage_senderId_idx`(`senderId`),
    INDEX `DirectMessage_isRead_idx`(`isRead`),
    INDEX `DirectMessage_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserBlock` (
    `id` VARCHAR(191) NOT NULL,
    `blockerId` VARCHAR(191) NOT NULL,
    `blockedUserId` VARCHAR(191) NOT NULL,
    `reason` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `UserBlock_blockerId_idx`(`blockerId`),
    INDEX `UserBlock_blockedUserId_idx`(`blockedUserId`),
    UNIQUE INDEX `UserBlock_blockerId_blockedUserId_key`(`blockerId`, `blockedUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JobPosting` (
    `id` VARCHAR(191) NOT NULL,
    `creatorId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(191) NOT NULL,
    `companyWebsite` VARCHAR(191) NULL,
    `companyLogoUrl` VARCHAR(191) NULL,
    `opportunityType` ENUM('FULL_TIME', 'INTERNSHIP', 'PART_TIME', 'REFERRAL') NOT NULL DEFAULT 'FULL_TIME',
    `workplaceType` ENUM('ON_SITE', 'HYBRID', 'REMOTE') NOT NULL DEFAULT 'ON_SITE',
    `location` VARCHAR(191) NOT NULL,
    `departmentEligibility` VARCHAR(191) NULL,
    `minCgpa` DOUBLE NULL,
    `experienceRequired` VARCHAR(191) NULL,
    `description` TEXT NOT NULL,
    `requirements` TEXT NULL,
    `applicationDeadline` DATETIME(3) NULL,
    `status` ENUM('ACTIVE', 'EXPIRED', 'CLOSED', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    `moderatedByAdminId` VARCHAR(191) NULL,
    `moderationNotes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `JobPosting_creatorId_idx`(`creatorId`),
    INDEX `JobPosting_companyName_idx`(`companyName`),
    INDEX `JobPosting_opportunityType_idx`(`opportunityType`),
    INDEX `JobPosting_workplaceType_idx`(`workplaceType`),
    INDEX `JobPosting_status_idx`(`status`),
    INDEX `JobPosting_applicationDeadline_idx`(`applicationDeadline`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JobApplication` (
    `id` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `resumeUrl` VARCHAR(191) NOT NULL,
    `coverNote` TEXT NULL,
    `status` ENUM('APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'REJECTED', 'OFFERED') NOT NULL DEFAULT 'APPLIED',
    `feedback` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `JobApplication_jobId_idx`(`jobId`),
    INDEX `JobApplication_studentId_idx`(`studentId`),
    INDEX `JobApplication_status_idx`(`status`),
    UNIQUE INDEX `JobApplication_jobId_studentId_key`(`jobId`, `studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JobApplicationStatusHistory` (
    `id` VARCHAR(191) NOT NULL,
    `applicationId` VARCHAR(191) NOT NULL,
    `previousStatus` ENUM('APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'REJECTED', 'OFFERED') NOT NULL,
    `newStatus` ENUM('APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'REJECTED', 'OFFERED') NOT NULL,
    `changedByUserId` VARCHAR(191) NOT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `JobApplicationStatusHistory_applicationId_idx`(`applicationId`),
    INDEX `JobApplicationStatusHistory_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SavedJob` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SavedJob_userId_idx`(`userId`),
    INDEX `SavedJob_jobId_idx`(`jobId`),
    UNIQUE INDEX `SavedJob_userId_jobId_key`(`userId`, `jobId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CampusEvent` (
    `id` VARCHAR(191) NOT NULL,
    `authorAdminId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `category` ENUM('ALUMNI_MEET', 'WEBINAR', 'WORKSHOP', 'REUNION', 'PLACEMENT_TALK', 'GUEST_LECTURE') NOT NULL,
    `description` TEXT NOT NULL,
    `bannerUrl` VARCHAR(191) NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `venue` VARCHAR(191) NOT NULL,
    `isVirtual` BOOLEAN NOT NULL DEFAULT false,
    `meetingLink` VARCHAR(191) NULL,
    `maxCapacity` INTEGER NULL,
    `targetAudience` ENUM('ALL', 'STUDENTS_ONLY', 'ALUMNI_ONLY', 'DEPARTMENT_SPECIFIC') NOT NULL DEFAULT 'ALL',
    `targetDepartment` VARCHAR(191) NULL,
    `status` ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CampusEvent_authorAdminId_idx`(`authorAdminId`),
    INDEX `CampusEvent_category_idx`(`category`),
    INDEX `CampusEvent_startTime_idx`(`startTime`),
    INDEX `CampusEvent_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EventRegistration` (
    `id` VARCHAR(191) NOT NULL,
    `eventId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `attendanceStatus` ENUM('REGISTERED', 'ATTENDED', 'ABSENT', 'CANCELLED') NOT NULL DEFAULT 'REGISTERED',
    `attendedAt` DATETIME(3) NULL,
    `feedbackRating` INTEGER NULL,
    `feedbackComment` TEXT NULL,
    `registeredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `EventRegistration_eventId_idx`(`eventId`),
    INDEX `EventRegistration_userId_idx`(`userId`),
    INDEX `EventRegistration_attendanceStatus_idx`(`attendanceStatus`),
    UNIQUE INDEX `EventRegistration_eventId_userId_key`(`eventId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Announcement` (
    `id` VARCHAR(191) NOT NULL,
    `authorAdminId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `category` ENUM('GENERAL_CIRCULAR', 'PLACEMENT_UPDATE', 'ALUMNI_MEET_NOTICE', 'ACADEMIC_CALENDAR', 'DEPARTMENTAL', 'URGENT') NOT NULL,
    `content` TEXT NOT NULL,
    `targetAudience` ENUM('ALL', 'STUDENTS_ONLY', 'ALUMNI_ONLY', 'DEPARTMENT_SPECIFIC') NOT NULL DEFAULT 'ALL',
    `targetDepartment` VARCHAR(191) NULL,
    `targetBatchYear` INTEGER NULL,
    `priority` ENUM('NORMAL', 'HIGH', 'URGENT') NOT NULL DEFAULT 'NORMAL',
    `attachmentUrl` VARCHAR(191) NULL,
    `publishedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'PUBLISHED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Announcement_authorAdminId_idx`(`authorAdminId`),
    INDEX `Announcement_category_idx`(`category`),
    INDEX `Announcement_targetAudience_idx`(`targetAudience`),
    INDEX `Announcement_priority_idx`(`priority`),
    INDEX `Announcement_status_idx`(`status`),
    INDEX `Announcement_publishedAt_idx`(`publishedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DiscussionPost` (
    `id` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `channel` ENUM('CAREER_ADVICE', 'INTERVIEW_PREP', 'PROJECTS_TECH', 'CAMPUS_LIFE', 'GENERAL') NOT NULL DEFAULT 'GENERAL',
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `upvoteCount` INTEGER NOT NULL DEFAULT 0,
    `commentCount` INTEGER NOT NULL DEFAULT 0,
    `isPinned` BOOLEAN NOT NULL DEFAULT false,
    `isLocked` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('ACTIVE', 'FLAGGED', 'REMOVED_BY_MODERATOR') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `DiscussionPost_authorId_idx`(`authorId`),
    INDEX `DiscussionPost_channel_idx`(`channel`),
    INDEX `DiscussionPost_upvoteCount_idx`(`upvoteCount`),
    INDEX `DiscussionPost_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DiscussionComment` (
    `id` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `status` ENUM('ACTIVE', 'FLAGGED', 'REMOVED_BY_MODERATOR') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `DiscussionComment_postId_idx`(`postId`),
    INDEX `DiscussionComment_authorId_idx`(`authorId`),
    INDEX `DiscussionComment_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PostLike` (
    `id` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PostLike_postId_idx`(`postId`),
    INDEX `PostLike_userId_idx`(`userId`),
    UNIQUE INDEX `PostLike_postId_userId_key`(`postId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PostReport` (
    `id` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `reporterId` VARCHAR(191) NOT NULL,
    `reason` ENUM('SPAM', 'HARASSMENT', 'MISINFORMATION', 'OFF_TOPIC', 'OTHER') NOT NULL,
    `notes` TEXT NULL,
    `status` ENUM('PENDING', 'REVIEWED', 'ACTION_TAKEN', 'DISMISSED') NOT NULL DEFAULT 'PENDING',
    `reviewedByAdminId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PostReport_postId_idx`(`postId`),
    INDEX `PostReport_reporterId_idx`(`reporterId`),
    INDEX `PostReport_reason_idx`(`reason`),
    INDEX `PostReport_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('MENTORSHIP_REQUEST_RECEIVED', 'MENTORSHIP_ACCEPTED', 'MENTORSHIP_DECLINED', 'MESSAGE_REQUEST_RECEIVED', 'MESSAGE_REQUEST_ACCEPTED', 'JOB_APPLICATION_STATUS_UPDATED', 'EVENT_REMINDER', 'ANNOUNCEMENT_NEW', 'VERIFICATION_APPROVED', 'VERIFICATION_REJECTED', 'ACCOUNT_SUSPENDED', 'APPEAL_RESOLVED') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `entityType` VARCHAR(191) NULL,
    `entityId` VARCHAR(191) NULL,
    `actionUrl` VARCHAR(191) NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Notification_userId_idx`(`userId`),
    INDEX `Notification_type_idx`(`type`),
    INDEX `Notification_isRead_idx`(`isRead`),
    INDEX `Notification_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `StudentProfile_isVerified_idx` ON `StudentProfile`(`isVerified`);

-- CreateIndex
CREATE INDEX `User_status_idx` ON `User`(`status`);

-- AddForeignKey
ALTER TABLE `StudentVerification` ADD CONSTRAINT `StudentVerification_studentProfileId_fkey` FOREIGN KEY (`studentProfileId`) REFERENCES `StudentProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentVerification` ADD CONSTRAINT `StudentVerification_reviewedByAdminId_fkey` FOREIGN KEY (`reviewedByAdminId`) REFERENCES `AdminProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SuspiciousProfileReport` ADD CONSTRAINT `SuspiciousProfileReport_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SuspiciousProfileReport` ADD CONSTRAINT `SuspiciousProfileReport_investigatedByAdminId_fkey` FOREIGN KEY (`investigatedByAdminId`) REFERENCES `AdminProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserReport` ADD CONSTRAINT `UserReport_reporterId_fkey` FOREIGN KEY (`reporterId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserReport` ADD CONSTRAINT `UserReport_reportedUserId_fkey` FOREIGN KEY (`reportedUserId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserReport` ADD CONSTRAINT `UserReport_resolvedByAdminId_fkey` FOREIGN KEY (`resolvedByAdminId`) REFERENCES `AdminProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccountAppeal` ADD CONSTRAINT `AccountAppeal_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccountAppeal` ADD CONSTRAINT `AccountAppeal_reviewedByAdminId_fkey` FOREIGN KEY (`reviewedByAdminId`) REFERENCES `AdminProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdminAuditLog` ADD CONSTRAINT `AdminAuditLog_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `AdminProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MentorshipRequest` ADD CONSTRAINT `MentorshipRequest_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `StudentProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MentorshipRequest` ADD CONSTRAINT `MentorshipRequest_alumniId_fkey` FOREIGN KEY (`alumniId`) REFERENCES `AlumniProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MentorshipSession` ADD CONSTRAINT `MentorshipSession_requestId_fkey` FOREIGN KEY (`requestId`) REFERENCES `MentorshipRequest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MessageRequest` ADD CONSTRAINT `MessageRequest_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MessageRequest` ADD CONSTRAINT `MessageRequest_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConversationParticipant` ADD CONSTRAINT `ConversationParticipant_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `Conversation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConversationParticipant` ADD CONSTRAINT `ConversationParticipant_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectMessage` ADD CONSTRAINT `DirectMessage_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `Conversation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectMessage` ADD CONSTRAINT `DirectMessage_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserBlock` ADD CONSTRAINT `UserBlock_blockerId_fkey` FOREIGN KEY (`blockerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserBlock` ADD CONSTRAINT `UserBlock_blockedUserId_fkey` FOREIGN KEY (`blockedUserId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobPosting` ADD CONSTRAINT `JobPosting_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobPosting` ADD CONSTRAINT `JobPosting_moderatedByAdminId_fkey` FOREIGN KEY (`moderatedByAdminId`) REFERENCES `AdminProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobApplication` ADD CONSTRAINT `JobApplication_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `JobPosting`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobApplication` ADD CONSTRAINT `JobApplication_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `StudentProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobApplicationStatusHistory` ADD CONSTRAINT `JobApplicationStatusHistory_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `JobApplication`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobApplicationStatusHistory` ADD CONSTRAINT `JobApplicationStatusHistory_changedByUserId_fkey` FOREIGN KEY (`changedByUserId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SavedJob` ADD CONSTRAINT `SavedJob_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SavedJob` ADD CONSTRAINT `SavedJob_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `JobPosting`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CampusEvent` ADD CONSTRAINT `CampusEvent_authorAdminId_fkey` FOREIGN KEY (`authorAdminId`) REFERENCES `AdminProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventRegistration` ADD CONSTRAINT `EventRegistration_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `CampusEvent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventRegistration` ADD CONSTRAINT `EventRegistration_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Announcement` ADD CONSTRAINT `Announcement_authorAdminId_fkey` FOREIGN KEY (`authorAdminId`) REFERENCES `AdminProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiscussionPost` ADD CONSTRAINT `DiscussionPost_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiscussionComment` ADD CONSTRAINT `DiscussionComment_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `DiscussionPost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiscussionComment` ADD CONSTRAINT `DiscussionComment_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostLike` ADD CONSTRAINT `PostLike_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `DiscussionPost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostLike` ADD CONSTRAINT `PostLike_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostReport` ADD CONSTRAINT `PostReport_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `DiscussionPost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostReport` ADD CONSTRAINT `PostReport_reporterId_fkey` FOREIGN KEY (`reporterId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostReport` ADD CONSTRAINT `PostReport_reviewedByAdminId_fkey` FOREIGN KEY (`reviewedByAdminId`) REFERENCES `AdminProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
