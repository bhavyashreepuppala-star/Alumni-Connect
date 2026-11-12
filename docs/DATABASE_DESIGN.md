# Alumni Connect — Complete Relational Database Specification

**Project:** Alumni Connect  
**Database Engine:** MySQL 8 (InnoDB Engine)  
**ORM Framework:** Prisma 6  
**Document Version:** 2.0 (Phase 2 Database Design)  
**Status:** Design Proposal (Awaiting Approval)  

---

## 1. Executive Summary & Design Principles

Alumni Connect requires an institutional-grade, highly normalized relational database architecture running exclusively on **MySQL 8**. 

### Core Relational Architecture Rules
1. **Strictly MySQL 8:** MySQL InnoDB engine with full ACID compliance, foreign key cascade integrity, and `utf8mb4_unicode_ci` character encoding. No NoSQL or MongoDB elements are permitted.
2. **Preserve Existing Foundation:** Reuse and extend the nine existing verified tables (`User`, `StudentProfile`, `AlumniProfile`, `AdminProfile`, `AlumniVerification`, `LinkedAccount`, `Skill`, `UserSkill`, and `_prisma_migrations`) without breaking backward compatibility or losing seeded data.
3. **Explicit State Gating:** Enforce multi-tier verification and account states (`PENDING_VERIFICATION`, `VERIFIED`, `REJECTED`, `SUSPENDED`) directly at the database level.
4. **Voluntary Alumni Participation:** Zero mandatory mentorship, messaging, or job posting obligations. The database schema enforces that mentorship and messaging channels exist only after explicit alumni acceptance.
5. **Auditing & Accountability:** Critical administrative actions (verification approvals, rejections, suspensions, and reinstatements) and security reports are recorded in immutable audit tables.
6. **Privacy by Design:** Zero plaintext passwords (`passwordHash` with bcrypt). Identity documents and resumes are referenced via signed cloud URLs (e.g., Cloudinary) rather than stored as large binary blobs in MySQL.

---

## 2. Inconsistencies Discovered in Existing Schema vs. Requirements

Before presenting the new design, a careful cross-inspection of `server/prisma/schema.prisma`, `init_schema` migration, and `docs/PROJECT_REQUIREMENTS.md` revealed the following discrepancies:

| Area | Existing Database State (`init_schema`) | Documented Requirement (`PROJECT_REQUIREMENTS.md`) | Resolution in Proposed Design |
| :--- | :--- | :--- | :--- |
| **Account Status on User** | `User` only possesses `isEmailVerified: Boolean` and `isActive: Boolean`. | Users must transition across 4 formal states: `PENDING_VERIFICATION`, `VERIFIED`, `REJECTED`, `SUSPENDED`. | Add `status AccountStatus @default(PENDING_VERIFICATION)` to `User`. |
| **Student Verification** | Only `AlumniVerification` exists. No verification table or audit trail exists for `StudentProfile`. | Both students and alumni must undergo identity verification against college registrar archives. | Introduce dedicated `StudentVerification` entity with USN matching and document links. |
| **Administrative Auditing** | `AdminProfile.permissions` is a comma-separated string; no action logging table exists. | Mandatory accountability logs for approvals, rejections, suspensions, and reinstatements. | Introduce immutable `AdminAuditLog` table. |
| **Voluntary Alumni Capacity** | `AlumniProfile` has boolean `isWillingToMentor`, but no capacity constraint. | Alumni must be able to cap monthly mentee intake (e.g., 2 mentees/month). | Add `maxMentees Int @default(2)` and `activeMenteesCount Int @default(0)` to `AlumniProfile`. |
| **Modules D through J** | Tables for Mentorship, Messaging, Jobs, Events, Announcements, Forums, and Notifications do not exist yet. | Full specifications detailed in Requirements and User Flows. | Fully specified in this relational design document. |

---

## 3. Entity Catalog by Functional Module

---

### Module A: User & Identity Management

#### 1. `User` (Existing & Extended)
Central authentication table for all institutional actors.
- **Attributes:**
  - `id`: `VARCHAR(191)` — Primary Key (`cuid`)
  - `email`: `VARCHAR(191)` — Institutional or personal email. **UNIQUE INDEX**
  - `passwordHash`: `VARCHAR(191)` — Bcrypt hashed credential (work factor $\ge 10$)
  - `role`: `ENUM('STUDENT', 'ALUMNI', 'ADMIN')` — Primary platform role. **INDEX**
  - `status`: `ENUM('PENDING_VERIFICATION', 'VERIFIED', 'REJECTED', 'SUSPENDED')` — Account lifecycle status. **INDEX** *(Proposed Extension)*
  - `isEmailVerified`: `BOOLEAN` — Default `false`
  - `isActive`: `BOOLEAN` — Default `true` (soft-deactivation switch)
  - `avatarUrl`: `VARCHAR(255)` — Optional profile photo URL
  - `createdAt`: `DATETIME(3)` — Timestamp (`CURRENT_TIMESTAMP(3)`)
  - `updatedAt`: `DATETIME(3)` — Auto-updated timestamp
- **Relationships:**
  - 1-to-1 with `StudentProfile` (Optional, `onDelete: Cascade`)
  - 1-to-1 with `AlumniProfile` (Optional, `onDelete: Cascade`)
  - 1-to-1 with `AdminProfile` (Optional, `onDelete: Cascade`)
  - 1-to-Many with `LinkedAccount` (`onDelete: Cascade`)
  - 1-to-Many with `UserSkill` (`onDelete: Cascade`)
  - 1-to-Many with `Notification` (`onDelete: Cascade`)

#### 2. `StudentProfile` (Existing & Extended)
Extended academic profile for enrolled undergraduate and postgraduate students.
- **Attributes:**
  - `id`: `VARCHAR(191)` — Primary Key (`cuid`)
  - `userId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `User(id)`. **UNIQUE INDEX**
  - `rollNumber`: `VARCHAR(191)` — University Serial Number (USN) / College Roll ID. **UNIQUE INDEX**
  - `department`: `VARCHAR(191)` — Academic department (e.g., "Computer Science"). **INDEX**
  - `degree`: `VARCHAR(191)` — Degree program (Default: `'B.Tech'`)
  - `expectedGraduationYear`: `INTEGER` — Anticipated passout year. **INDEX**
  - `currentSemester`: `INTEGER` — Current academic term (1 to 8)
  - `cgpa`: `DOUBLE` — Cumulative Grade Point Average (0.0 to 10.0 or 4.0 scale)
  - `bio`: `TEXT` — Personal narrative & career aspirations
  - `headline`: `VARCHAR(191)` — Short professional tagline
  - `resumeUrl`: `VARCHAR(255)` — Cloud storage link to PDF resume
  - `portfolioUrl`: `VARCHAR(255)` — Link to portfolio website
  - `githubUrl`: `VARCHAR(255)` — Link to GitHub repository profile
  - `linkedinUrl`: `VARCHAR(255)` — Link to public LinkedIn profile
  - `isVerified`: `BOOLEAN` — Default `false`. **INDEX** *(Proposed Extension)*
  - `createdAt`: `DATETIME(3)`
  - `updatedAt`: `DATETIME(3)`
- **Relationships:**
  - Belongs to `User` (`userId` $\rightarrow$ `User.id`)
  - 1-to-Many with `StudentVerification`
  - 1-to-Many with `MentorshipRequest` (as student applicant)
  - 1-to-Many with `JobApplication` (as job applicant)

#### 3. `AlumniProfile` (Existing & Extended)
Professional identity record for verified graduates.
- **Attributes:**
  - `id`: `VARCHAR(191)` — Primary Key (`cuid`)
  - `userId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `User(id)`. **UNIQUE INDEX**
  - `graduationYear`: `INTEGER` — Year degree was conferred. **INDEX**
  - `degree`: `VARCHAR(191)` — Conferred degree (e.g., "B.Tech CSE")
  - `department`: `VARCHAR(191)` — Alma mater branch. **INDEX**
  - `currentCompany`: `VARCHAR(191)` — Current employer. **INDEX**
  - `currentDesignation`: `VARCHAR(191)` — Professional job title
  - `industry`: `VARCHAR(191)` — Industry sector (e.g., "Software & Cloud"). **INDEX**
  - `yearsOfExperience`: `INTEGER` — Total post-graduation experience (Default: `0`)
  - `city`: `VARCHAR(191)` — Current residential city
  - `country`: `VARCHAR(191)` — Current residential country
  - `bio`: `TEXT` — Professional background summary
  - `linkedinUrl`: `VARCHAR(255)` — Public LinkedIn URL
  - `isWillingToMentor`: `BOOLEAN` — Master voluntary mentorship toggle. **INDEX**
  - `maxMentees`: `INTEGER` — Maximum concurrent/monthly mentees (Default: `2`) *(Proposed Extension)*
  - `mentorshipTopics`: `VARCHAR(255)` — Comma-delimited or structured specialties
  - `isVerified`: `BOOLEAN` — Verification badge flag (Default: `false`). **INDEX**
  - `createdAt`: `DATETIME(3)`
  - `updatedAt`: `DATETIME(3)`
- **Relationships:**
  - Belongs to `User` (`userId` $\rightarrow$ `User.id`)
  - 1-to-Many with `AlumniVerification`
  - 1-to-Many with `MentorshipRequest` (as target mentor)
  - 1-to-Many with `JobPosting` (as voluntary job poster)

#### 4. `AdminProfile` (Existing & Extended)
Governance profile for faculty, Dean of Alumni Affairs, and CDC coordinators.
- **Attributes:**
  - `id`: `VARCHAR(191)` — Primary Key (`cuid`)
  - `userId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `User(id)`. **UNIQUE INDEX**
  - `employeeId`: `VARCHAR(191)` — Institutional Staff ID. **UNIQUE INDEX**
  - `department`: `VARCHAR(191)` — Administrative unit (e.g., "Office of Career Services"). **INDEX**
  - `designation`: `VARCHAR(191)` — Official title (e.g., "Placement Officer")
  - `permissions`: `VARCHAR(255)` — Comma-separated permission tokens (Default: `'VERIFY_ALUMNI,MANAGE_USERS,VIEW_ANALYTICS'`)
  - `createdAt`: `DATETIME(3)`
  - `updatedAt`: `DATETIME(3)`
- **Relationships:**
  - Belongs to `User` (`userId` $\rightarrow$ `User.id`)
  - 1-to-Many with `AlumniVerification` (as reviewer)
  - 1-to-Many with `StudentVerification` (as reviewer)
  - 1-to-Many with `AdminAuditLog` (as performing admin)
  - 1-to-Many with `CampusEvent` (as event author)
  - 1-to-Many with `Announcement` (as circular publisher)

#### 5. `LinkedAccount` (Existing)
Stores authorized OAuth 2.0 and OpenID Connect credential bindings.
- **Attributes:**
  - `id`: `VARCHAR(191)` — Primary Key (`cuid`)
  - `userId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `User(id)`. **INDEX**
  - `provider`: `ENUM('LINKEDIN', 'GOOGLE', 'GITHUB')`
  - `providerAccountId`: `VARCHAR(191)` — Provider unique subject claim (`sub`)
  - `profileUrl`: `VARCHAR(255)` — Public profile URL
  - `accessToken`: `TEXT` — Encrypted access token
  - `refreshToken`: `TEXT` — Encrypted refresh token
  - `expiresAt`: `DATETIME(3)` — Token expiration timestamp
  - `scope`: `VARCHAR(255)` — Approved scopes (`openid profile email w_member_social`)
  - `rawProfile`: `TEXT` — JSON claims payload
  - `createdAt`: `DATETIME(3)`
  - `updatedAt`: `DATETIME(3)`
- **Constraints:**
  - **UNIQUE INDEX:** `(provider, providerAccountId)`

#### 6. `Skill` & `UserSkill` (Existing)
Normalized taxonomy of technical, business, and leadership proficiencies.
- **`Skill`:** `id`, `name` (UNIQUE), `slug` (UNIQUE), `category` (INDEX), `createdAt`, `updatedAt`.
- **`UserSkill`:** `id`, `userId` (FK $\rightarrow$ `User`), `skillId` (FK $\rightarrow$ `Skill`), `proficiency` (`ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')`), `endorsementsCount`, `createdAt`. **UNIQUE INDEX:** `(userId, skillId)`.

---

### Module B: Verification, Auditing & Trust

#### 7. `AlumniVerification` (Existing & Reused)
Audit-ready record of alumni graduation credential submissions.
- **Attributes:**
  - `id`: `VARCHAR(191)` — Primary Key (`cuid`)
  - `alumniProfileId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `AlumniProfile(id)`. **INDEX**
  - `status`: `ENUM('PENDING', 'APPROVED', 'REJECTED')` — Default: `'PENDING'`. **INDEX**
  - `documentType`: `VARCHAR(191)` — `DEGREE_CERTIFICATE`, `TRANSCRIPT`, `CONVOCATION_RECORD`, `LINKEDIN_OIDC`
  - `documentUrl`: `VARCHAR(255)` — Secure Cloudinary storage URL
  - `submissionNotes`: `TEXT` — Applicant remarks
  - `reviewNotes`: `TEXT` — Documented feedback (mandatory on rejection)
  - `reviewedByAdminId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `AdminProfile(id)`. **INDEX**
  - `reviewedAt`: `DATETIME(3)` — Review timestamp
  - `createdAt`: `DATETIME(3)`
  - `updatedAt`: `DATETIME(3)`
- **Cardinality:** 1 `AlumniProfile` has many `AlumniVerification` submissions (supports re-application upon rejection).

#### 8. `StudentVerification` (Proposed New Entity)
Validates enrolled student identity against college records.
- **Attributes:**
  - `id`: `VARCHAR(191)` — Primary Key (`cuid`)
  - `studentProfileId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `StudentProfile(id)` ON DELETE CASCADE. **INDEX**
  - `status`: `ENUM('PENDING', 'APPROVED', 'REJECTED')` — Default: `'PENDING'`. **INDEX**
  - `verificationMethod`: `ENUM('COLLEGE_EMAIL_OTP', 'COLLEGE_ID_CARD', 'ADMISSION_ORDER', 'REGISTRAR_DATABASE_MATCH')`
  - `documentUrl`: `VARCHAR(255)` — Cloud storage link to uploaded student ID scan
  - `usnClaimed`: `VARCHAR(191)` — USN submitted for validation
  - `submissionNotes`: `TEXT` — Optional notes from student
  - `reviewNotes`: `TEXT` — Documented administrative review notes
  - `reviewedByAdminId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `AdminProfile(id)` ON DELETE SET NULL. **INDEX**
  - `reviewedAt`: `DATETIME(3)`
  - `createdAt`: `DATETIME(3)`
  - `updatedAt`: `DATETIME(3)`

#### 9. `SuspiciousProfileReport` (Proposed New Entity)
Internal assistive scoring for automated anomaly detection. **Strict Rule: Never triggers automated bans.**
- **Attributes:**
  - `id`: `VARCHAR(191)` — Primary Key (`cuid`)
  - `userId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `User(id)` ON DELETE CASCADE. **INDEX**
  - `suspicionScore`: `INTEGER` — Algorithmic suspicion score (0 to 100)
  - `anomalyFlags`: `VARCHAR(255)` — Comma-delimited flags (e.g., `DISPOSABLE_EMAIL,USN_FORMAT_MISMATCH,RAPID_OUTBOUND_SPAM`)
  - `evidenceMetadata`: `JSON` — Algorithmic diagnostic telemetry
  - `status`: `ENUM('FLAGGED', 'INVESTIGATING', 'DISMISSED', 'ACTION_TAKEN')` — Default: `'FLAGGED'`. **INDEX**
  - `investigatedByAdminId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `AdminProfile(id)` ON DELETE SET NULL. **INDEX**
  - `investigationNotes`: `TEXT` — Human investigator documentation
  - `createdAt`: `DATETIME(3)`
  - `updatedAt`: `DATETIME(3)`

#### 10. `UserReport` (Proposed New Entity)
Member-to-member abuse reporting for platform safety.
- **Attributes:**
  - `id`: `VARCHAR(191)` — Primary Key (`cuid`)
  - `reporterId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `User(id)` ON DELETE CASCADE. **INDEX**
  - `reportedUserId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `User(id)` ON DELETE CASCADE. **INDEX**
  - `category`: `ENUM('HARASSMENT', 'SPAM', 'FAKE_PROFILE', 'IMPERSONATION', 'INAPPROPRIATE_CONTENT', 'OTHER')`. **INDEX**
  - `description`: `TEXT` — Submitter narrative
  - `evidenceUrl`: `VARCHAR(255)` — Optional screenshot proof
  - `status`: `ENUM('PENDING', 'UNDER_INVESTIGATION', 'ACTION_TAKEN', 'DISMISSED')` — Default: `'PENDING'`. **INDEX**
  - `resolvedByAdminId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `AdminProfile(id)` ON DELETE SET NULL
  - `resolutionNotes`: `TEXT` — Documented moderator conclusion
  - `createdAt`: `DATETIME(3)`
  - `updatedAt`: `DATETIME(3)`

#### 11. `AccountAppeal` (Proposed New Entity)
Structured reconsideration workflow for rejected or suspended users.
- **Attributes:**
  - `id`: `VARCHAR(191)` — Primary Key (`cuid`)
  - `userId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `User(id)` ON DELETE CASCADE. **INDEX**
  - `actionAppealed`: `ENUM('VERIFICATION_REJECTION', 'ACCOUNT_SUSPENSION')`. **INDEX**
  - `appealStatement`: `TEXT` — Formal defense narrative from the user
  - `supplementalDocUrl`: `VARCHAR(255)` — Supplemental identity proof
  - `status`: `ENUM('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED')` — Default: `'PENDING'`. **INDEX**
  - `reviewedByAdminId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `AdminProfile(id)` ON DELETE SET NULL
  - `resolutionVerdict`: `TEXT` — Mandatory justification on appeal outcome
  - `reviewedAt`: `DATETIME(3)`
  - `createdAt`: `DATETIME(3)`
  - `updatedAt`: `DATETIME(3)`

---

### Module C: Admin Management & Accountability

#### 12. `AdminAuditLog` (Proposed New Entity)
Immutable audit trail recording administrative governance actions.
- **Attributes:**
  - `id`: `VARCHAR(191)` — Primary Key (`cuid`)
  - `adminId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `AdminProfile(id)` ON DELETE RESTRICT. **INDEX**
  - `action`: `ENUM('USER_APPROVE', 'USER_REJECT', 'USER_SUSPEND', 'USER_REINSTATE', 'POST_DELETE', 'JOB_MODERATE', 'EVENT_CANCEL', 'ANNOUNCEMENT_PUBLISH', 'APPEAL_RESOLVE')`. **INDEX**
  - `targetType`: `VARCHAR(64)` — Target entity table (e.g., `'User'`, `'AlumniVerification'`, `'JobPosting'`). **INDEX**
  - `targetId`: `VARCHAR(191)` — ID of the affected entity. **INDEX**
  - `reason`: `TEXT` — Mandatory written justification
  - `previousState`: `JSON` — State snapshot before modification
  - `newState`: `JSON` — State snapshot after modification
  - `ipAddress`: `VARCHAR(45)` — Client IP address (IPv4/IPv6)
  - `userAgent`: `VARCHAR(255)` — Client browser / agent
  - `createdAt`: `DATETIME(3)` — Timestamp (`CURRENT_TIMESTAMP(3)`). **INDEX**
- **Constraints:**
  - **No UPDATE or DELETE:** This table is append-only.

---

### Module D: Mentorship

#### 13. `MentorshipRequest` (Proposed New Entity)
Structured request initiation. Enforces fair-use limits and mandatory reasons.
- **Attributes:**
  - `id`: `VARCHAR(191)` — Primary Key (`cuid`)
  - `studentId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `StudentProfile(id)` ON DELETE CASCADE. **INDEX**
  - `alumniId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `AlumniProfile(id)` ON DELETE CASCADE. **INDEX**
  - `topic`: `VARCHAR(191)` — Specific focus (e.g., "Mock System Design Interview")
  - `reason`: `TEXT` — Mandatory statement of purpose (100–500 words)
  - `status`: `ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED', 'COMPLETED')` — Default: `'PENDING'`. **INDEX**
  - `alumniResponseNote`: `TEXT` — Optional reply note from alumnus
  - `createdAt`: `DATETIME(3)`
  - `updatedAt`: `DATETIME(3)`
- **Constraints:**
  - **UNIQUE INDEX:** `(studentId, alumniId, status)` for active `PENDING` requests (prevents duplicate spam requests to the same mentor).

#### 14. `MentorshipSession` (Proposed New Entity)
Confirmed session generated **strictly** after an alumnus clicks "Accept".
- **Attributes:**
  - `id`: `VARCHAR(191)` — Primary Key (`cuid`)
  - `requestId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `MentorshipRequest(id)` ON DELETE CASCADE. **UNIQUE INDEX**
  - `scheduledAt`: `DATETIME(3)` — Agreed session date and time. **INDEX**
  - `durationMinutes`: `INTEGER` — Default: `45`
  - `meetingType`: `ENUM('GOOGLE_MEET', 'ZOOM', 'IN_PERSON', 'CUSTOM_URL')` — Default: `'GOOGLE_MEET'`
  - `meetingUrl`: `VARCHAR(512)` — Meeting link (Google Meet / Zoom URL)
  - `status`: `ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'RESCHEDULED', 'NO_SHOW', 'CANCELLED')` — Default: `'SCHEDULED'`. **INDEX**
  - `studentFeedback`: `TEXT` — Private review from student
  - `alumniFeedback`: `TEXT` — Private review from alumnus
  - `createdAt`: `DATETIME(3)`
  - `updatedAt`: `DATETIME(3)`

---

### Module E: Messaging & Communication Gating

#### 15. `MessageRequest` (Proposed New Entity)
Inbound holding queue protecting alumni from unsolicited inbox flooding.
- **Attributes:**
  - `id`: `VARCHAR(191)` — Primary Key (`cuid`)
  - `senderId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `User(id)` ON DELETE CASCADE. **INDEX**
  - `receiverId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `User(id)` ON DELETE CASCADE. **INDEX**
  - `introduction`: `VARCHAR(500)` — Context note explaining outreach
  - `status`: `ENUM('PENDING', 'ACCEPTED', 'DECLINED')` — Default: `'PENDING'`. **INDEX**
  - `respondedAt`: `DATETIME(3)`
  - `createdAt`: `DATETIME(3)`
  - `updatedAt`: `DATETIME(3)`
- **Constraints:**
  - **UNIQUE INDEX:** `(senderId, receiverId)`

#### 16. `Conversation` (Proposed New Entity)
Unlocked direct communication thread.
- **Attributes:**
  - `id`: `VARCHAR(191)` — Primary Key (`cuid`)
  - `type`: `ENUM('DIRECT_MENTORSHIP', 'PEER_DIRECT', 'ADMIN_SUPPORT')` — Default: `'DIRECT_MENTORSHIP'`
  - `lastMessageAt`: `DATETIME(3)` — Timestamp of most recent activity. **INDEX**
  - `createdAt`: `DATETIME(3)`
  - `updatedAt`: `DATETIME(3)`

#### 17. `ConversationParticipant` (Proposed New Entity)
Associative join table between users and conversations.
- **Attributes:**
  - `id`: `VARCHAR(191)` — Primary Key (`cuid`)
  - `conversationId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `Conversation(id)` ON DELETE CASCADE. **INDEX**
  - `userId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `User(id)` ON DELETE CASCADE. **INDEX**
  - `lastReadAt`: `DATETIME(3)` — For calculating unread message counts
  - `createdAt`: `DATETIME(3)`
  - `updatedAt`: `DATETIME(3)`
- **Constraints:**
  - **UNIQUE INDEX:** `(conversationId, userId)`

#### 18. `DirectMessage` (Proposed New Entity)
Individual messages within a conversation.
- **Attributes:**
  - `id`: `VARCHAR(191)` — Primary Key (`cuid`)
  - `conversationId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `Conversation(id)` ON DELETE CASCADE. **INDEX**
  - `senderId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `User(id)` ON DELETE CASCADE. **INDEX**
  - `content`: `TEXT` — Message text
  - `attachmentUrl`: `VARCHAR(255)` — Optional file attachment link
  - `isRead`: `BOOLEAN` — Default: `false`. **INDEX**
  - `createdAt`: `DATETIME(3)` — Timestamp (`CURRENT_TIMESTAMP(3)`). **INDEX**

#### 19. `UserBlock` (Proposed New Entity)
Suppresses all outbound/inbound contact between two users.
- **Attributes:**
  - `id`: `VARCHAR(191)` — Primary Key (`cuid`)
  - `blockerId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `User(id)` ON DELETE CASCADE. **INDEX**
  - `blockedUserId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `User(id)` ON DELETE CASCADE. **INDEX**
  - `reason`: `VARCHAR(255)` — Optional internal reason
  - `createdAt`: `DATETIME(3)`
- **Constraints:**
  - **UNIQUE INDEX:** `(blockerId, blockedUserId)`

---

### Module F: Jobs & Internships Hub

#### 20. `JobPosting` (Proposed New Entity)
Opportunities posted voluntarily by Alumni or directly by CDC Admin.
- **Attributes:**
  - `id`: `VARCHAR(191)` — Primary Key (`cuid`)
  - `creatorId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `User(id)` ON DELETE CASCADE. **INDEX**
  - `title`: `VARCHAR(191)` — Role title (e.g., "Associate Cloud Engineer")
  - `companyName`: `VARCHAR(191)` — Hiring organization. **INDEX**
  - `companyWebsite`: `VARCHAR(255)`
  - `companyLogoUrl`: `VARCHAR(255)`
  - `opportunityType`: `ENUM('FULL_TIME', 'INTERNSHIP', 'PART_TIME', 'REFERRAL')`. **INDEX**
  - `workplaceType`: `ENUM('ON_SITE', 'HYBRID', 'REMOTE')`. **INDEX**
  - `location`: `VARCHAR(191)` — Physical city/state or "Remote"
  - `departmentEligibility`: `VARCHAR(255)` — Target departmental branches
  - `minCgpa`: `DOUBLE` — Minimum grade cut-off
  - `experienceRequired`: `VARCHAR(64)` — e.g., "Freshers / 0-1 years"
  - `description`: `TEXT` — Job description and responsibilities
  - `requirements`: `TEXT` — Technical qualifications
  - `applicationDeadline`: `DATETIME(3)`. **INDEX**
  - `status`: `ENUM('ACTIVE', 'EXPIRED', 'CLOSED', 'SUSPENDED')` — Default: `'ACTIVE'`. **INDEX**
  - `moderatedByAdminId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `AdminProfile(id)` ON DELETE SET NULL
  - `moderationNotes`: `TEXT`
  - `createdAt`: `DATETIME(3)`
  - `updatedAt`: `DATETIME(3)`

#### 21. `JobApplication` (Proposed New Entity)
Student application records.
- **Attributes:**
  - `id`: `VARCHAR(191)` — Primary Key (`cuid`)
  - `jobId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `JobPosting(id)` ON DELETE CASCADE. **INDEX**
  - `studentId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `StudentProfile(id)` ON DELETE CASCADE. **INDEX**
  - `resumeUrl`: `VARCHAR(255)` — Specific resume version submitted
  - `coverNote`: `TEXT` — Applicant introductory pitch
  - `status`: `ENUM('APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'REJECTED', 'OFFERED')` — Default: `'APPLIED'`. **INDEX**
  - `createdAt`: `DATETIME(3)`
  - `updatedAt`: `DATETIME(3)`
- **Constraints:**
  - **UNIQUE INDEX:** `(jobId, studentId)` (one application per student per job)

#### 22. `JobApplicationStatusHistory` (Proposed New Entity)
Audit trail of candidate progression through recruitment stages.
- **Attributes:**
  - `id`: `VARCHAR(191)` — Primary Key (`cuid`)
  - `applicationId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `JobApplication(id)` ON DELETE CASCADE. **INDEX**
  - `previousStatus`: `ENUM('APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'REJECTED', 'OFFERED')`
  - `newStatus`: `ENUM('APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'REJECTED', 'OFFERED')`
  - `changedByUserId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `User(id)` ON DELETE CASCADE
  - `notes`: `TEXT` — Evaluation notes
  - `createdAt`: `DATETIME(3)` — Timestamp (`CURRENT_TIMESTAMP(3)`)

#### 23. `SavedJob` (Proposed New Entity)
Student bookmarks.
- **Attributes:**
  - `id`: `VARCHAR(191)` — Primary Key (`cuid`)
  - `userId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `User(id)` ON DELETE CASCADE. **INDEX**
  - `jobId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `JobPosting(id)` ON DELETE CASCADE. **INDEX**
  - `createdAt`: `DATETIME(3)`
- **Constraints:**
  - **UNIQUE INDEX:** `(userId, jobId)`

---

### Module G: Events & Alumni Meets

#### 24. `CampusEvent` (Proposed New Entity)
Webinars, masterclasses, reunions, and campus placement drives.
- **Attributes:**
  - `id`: `VARCHAR(191)` — Primary Key (`cuid`)
  - `authorAdminId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `AdminProfile(id)` ON DELETE RESTRICT. **INDEX**
  - `title`: `VARCHAR(191)` — Event title
  - `category`: `ENUM('ALUMNI_MEET', 'WEBINAR', 'WORKSHOP', 'REUNION', 'PLACEMENT_TALK', 'GUEST_LECTURE')`. **INDEX**
  - `description`: `TEXT` — Event summary and agenda
  - `bannerUrl`: `VARCHAR(255)` — Cover image link
  - `startTime`: `DATETIME(3)`. **INDEX**
  - `endTime`: `DATETIME(3)`
  - `venue`: `VARCHAR(191)` — Physical room or virtual host
  - `isVirtual`: `BOOLEAN` — Default: `false`
  - `meetingLink`: `VARCHAR(512)` — Virtual join link (Zoom / Meet)
  - `maxCapacity`: `INTEGER` — Optional seating/registration cap
  - `targetAudience`: `ENUM('ALL', 'STUDENTS_ONLY', 'ALUMNI_ONLY', 'DEPARTMENT_SPECIFIC')` — Default: `'ALL'`
  - `targetDepartment`: `VARCHAR(191)`
  - `status`: `ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')` — Default: `'SCHEDULED'`. **INDEX**
  - `createdAt`: `DATETIME(3)`
  - `updatedAt`: `DATETIME(3)`

#### 25. `EventRegistration` (Proposed New Entity)
Member registration and verified attendance tracking.
- **Attributes:**
  - `id`: `VARCHAR(191)` — Primary Key (`cuid`)
  - `eventId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `CampusEvent(id)` ON DELETE CASCADE. **INDEX**
  - `userId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `User(id)` ON DELETE CASCADE. **INDEX**
  - `attendanceStatus`: `ENUM('REGISTERED', 'ATTENDED', 'ABSENT', 'CANCELLED')` — Default: `'REGISTERED'`. **INDEX**
  - `attendedAt`: `DATETIME(3)` — Check-in timestamp
  - `feedbackRating`: `INTEGER` — Rating score (1 to 5)
  - `feedbackComment`: `TEXT` — Qualitative survey response
  - `registeredAt`: `DATETIME(3)` — Timestamp (`CURRENT_TIMESTAMP(3)`)
- **Constraints:**
  - **UNIQUE INDEX:** `(eventId, userId)`

---

### Module H: College Announcements

#### 26. `Announcement` (Proposed New Entity)
Official circulars, placement notifications, and alumni reunion bulletins.
- **Attributes:**
  - `id`: `VARCHAR(191)` — Primary Key (`cuid`)
  - `authorAdminId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `AdminProfile(id)` ON DELETE RESTRICT. **INDEX**
  - `title`: `VARCHAR(191)` — Notice headline
  - `category`: `ENUM('GENERAL_CIRCULAR', 'PLACEMENT_UPDATE', 'ALUMNI_MEET_NOTICE', 'ACADEMIC_CALENDAR', 'DEPARTMENTAL', 'URGENT')`. **INDEX**
  - `content`: `TEXT` — Formatted announcement text
  - `targetAudience`: `ENUM('ALL', 'STUDENTS_ONLY', 'ALUMNI_ONLY', 'DEPARTMENT_SPECIFIC')` — Default: `'ALL'`. **INDEX**
  - `targetDepartment`: `VARCHAR(191)`
  - `targetBatchYear`: `INTEGER`
  - `priority`: `ENUM('NORMAL', 'HIGH', 'URGENT')` — Default: `'NORMAL'`. **INDEX**
  - `attachmentUrl`: `VARCHAR(255)` — Downloadable PDF circular
  - `publishedAt`: `DATETIME(3)` — Timestamp (`CURRENT_TIMESTAMP(3)`). **INDEX**
  - `expiresAt`: `DATETIME(3)` — Optional auto-expiration date
  - `status`: `ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED')` — Default: `'PUBLISHED'`. **INDEX**
  - `createdAt`: `DATETIME(3)`
  - `updatedAt`: `DATETIME(3)`

---

### Module I: Community Forums & Moderation

#### 27. `DiscussionPost` (Proposed New Entity)
Student and alumni technical discussion and career Q&A threads.
- **Attributes:**
  - `id`: `VARCHAR(191)` — Primary Key (`cuid`)
  - `authorId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `User(id)` ON DELETE CASCADE. **INDEX**
  - `channel`: `ENUM('CAREER_ADVICE', 'INTERVIEW_PREP', 'PROJECTS_TECH', 'CAMPUS_LIFE', 'GENERAL')`. **INDEX**
  - `title`: `VARCHAR(191)` — Thread title
  - `content`: `TEXT` — Post body
  - `upvoteCount`: `INTEGER` — Denormalized score (Default: `0`). **INDEX**
  - `commentCount`: `INTEGER` — Denormalized reply counter (Default: `0`)
  - `isPinned`: `BOOLEAN` — Default: `false`
  - `isLocked`: `BOOLEAN` — Default: `false`
  - `status`: `ENUM('ACTIVE', 'FLAGGED', 'REMOVED_BY_MODERATOR')` — Default: `'ACTIVE'`. **INDEX**
  - `createdAt`: `DATETIME(3)`
  - `updatedAt`: `DATETIME(3)`

#### 28. `DiscussionComment` (Proposed New Entity)
Replies to forum posts.
- **Attributes:**
  - `id`: `VARCHAR(191)` — Primary Key (`cuid`)
  - `postId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `DiscussionPost(id)` ON DELETE CASCADE. **INDEX**
  - `authorId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `User(id)` ON DELETE CASCADE. **INDEX**
  - `content`: `TEXT` — Comment body
  - `status`: `ENUM('ACTIVE', 'FLAGGED', 'REMOVED_BY_MODERATOR')` — Default: `'ACTIVE'`. **INDEX**
  - `createdAt`: `DATETIME(3)`
  - `updatedAt`: `DATETIME(3)`

#### 29. `PostLike` (Proposed New Entity)
Upvote deduplication table.
- **Attributes:**
  - `id`: `VARCHAR(191)` — Primary Key (`cuid`)
  - `postId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `DiscussionPost(id)` ON DELETE CASCADE. **INDEX**
  - `userId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `User(id)` ON DELETE CASCADE. **INDEX**
  - `createdAt`: `DATETIME(3)`
- **Constraints:**
  - **UNIQUE INDEX:** `(postId, userId)`

#### 30. `PostReport` (Proposed New Entity)
Community moderation queue submissions.
- **Attributes:**
  - `id`: `VARCHAR(191)` — Primary Key (`cuid`)
  - `postId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `DiscussionPost(id)` ON DELETE CASCADE. **INDEX**
  - `reporterId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `User(id)` ON DELETE CASCADE. **INDEX**
  - `reason`: `ENUM('SPAM', 'HARASSMENT', 'MISINFORMATION', 'OFF_TOPIC', 'OTHER')`. **INDEX**
  - `notes`: `TEXT`
  - `status`: `ENUM('PENDING', 'REVIEWED', 'ACTION_TAKEN', 'DISMISSED')` — Default: `'PENDING'`. **INDEX**
  - `reviewedByAdminId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `AdminProfile(id)` ON DELETE SET NULL
  - `createdAt`: `DATETIME(3)`

---

### Module J: Notifications

#### 31. `Notification` (Proposed New Entity)
In-app notification ledger referenced to domain entities.
- **Attributes:**
  - `id`: `VARCHAR(191)` — Primary Key (`cuid`)
  - `userId`: `VARCHAR(191)` — Foreign Key $\rightarrow$ `User(id)` ON DELETE CASCADE. **INDEX**
  - `type`: `ENUM('MENTORSHIP_REQUEST_RECEIVED', 'MENTORSHIP_ACCEPTED', 'MENTORSHIP_DECLINED', 'MESSAGE_REQUEST_RECEIVED', 'MESSAGE_REQUEST_ACCEPTED', 'JOB_APPLICATION_STATUS_UPDATED', 'EVENT_REMINDER', 'ANNOUNCEMENT_NEW', 'VERIFICATION_APPROVED', 'VERIFICATION_REJECTED', 'ACCOUNT_SUSPENDED', 'APPEAL_RESOLVED')`. **INDEX**
  - `title`: `VARCHAR(191)` — Notification headline
  - `message`: `VARCHAR(500)` — Short summary
  - `entityType`: `VARCHAR(64)` — e.g., `'MentorshipRequest'`, `'JobApplication'`, `'CampusEvent'`
  - `entityId`: `VARCHAR(191)` — Target record ID
  - `actionUrl`: `VARCHAR(255)` — Client route link (e.g., `'/dashboard/student?session=xyz'`)
  - `isRead`: `BOOLEAN` — Default: `false`. **INDEX**
  - `createdAt`: `DATETIME(3)` — Timestamp (`CURRENT_TIMESTAMP(3)`). **INDEX**

---

## 4. Complete Foreign Key & Constraint Matrix

| Entity | Field | Referenced Entity(Field) | On Delete | On Update | Reason |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `StudentProfile` | `userId` | `User(id)` | CASCADE | CASCADE | Profile exists solely for user |
| `AlumniProfile` | `userId` | `User(id)` | CASCADE | CASCADE | Profile exists solely for user |
| `AdminProfile` | `userId` | `User(id)` | CASCADE | CASCADE | Profile exists solely for user |
| `LinkedAccount` | `userId` | `User(id)` | CASCADE | CASCADE | Social credentials purge with user |
| `UserSkill` | `userId` | `User(id)` | CASCADE | CASCADE | Skill links purge with user |
| `UserSkill` | `skillId` | `Skill(id)` | CASCADE | CASCADE | Skill association |
| `AlumniVerification` | `alumniProfileId` | `AlumniProfile(id)` | CASCADE | CASCADE | Verification tied to profile |
| `AlumniVerification` | `reviewedByAdminId` | `AdminProfile(id)` | SET NULL | CASCADE | Admin deletion preserves audit trail |
| `StudentVerification` | `studentProfileId`| `StudentProfile(id)`| CASCADE | CASCADE | Verification tied to profile |
| `StudentVerification` | `reviewedByAdminId`| `AdminProfile(id)` | SET NULL | CASCADE | Admin deletion preserves audit trail |
| `AdminAuditLog` | `adminId` | `AdminProfile(id)` | **RESTRICT** | CASCADE | **Audit logs must NEVER be deleted** |
| `MentorshipRequest` | `studentId` | `StudentProfile(id)`| CASCADE | CASCADE | Belongs to student |
| `MentorshipRequest` | `alumniId` | `AlumniProfile(id)` | CASCADE | CASCADE | Belongs to alumni |
| `MentorshipSession` | `requestId` | `MentorshipRequest(id)`| CASCADE| CASCADE | 1-to-1 confirmed session |
| `MessageRequest` | `senderId` | `User(id)` | CASCADE | CASCADE | Sender user |
| `MessageRequest` | `receiverId` | `User(id)` | CASCADE | CASCADE | Target user |
| `DirectMessage` | `conversationId` | `Conversation(id)` | CASCADE | CASCADE | Belongs to thread |
| `JobPosting` | `creatorId` | `User(id)` | CASCADE | CASCADE | Poster account |
| `JobApplication` | `jobId` | `JobPosting(id)` | CASCADE | CASCADE | Target job |
| `JobApplication` | `studentId` | `StudentProfile(id)`| CASCADE | CASCADE | Applicant |
| `CampusEvent` | `authorAdminId` | `AdminProfile(id)` | **RESTRICT** | CASCADE | Preserve event creator records |
| `EventRegistration` | `eventId` | `CampusEvent(id)` | CASCADE | CASCADE | Registration |
| `Announcement` | `authorAdminId` | `AdminProfile(id)` | **RESTRICT** | CASCADE | Preserve circular authorship |
| `DiscussionPost` | `authorId` | `User(id)` | CASCADE | CASCADE | Post author |
| `Notification` | `userId` | `User(id)` | CASCADE | CASCADE | Recipient user |
