# Alumni Connect — Project Requirements Document (PRD)

**Project Name:** Alumni Connect  
**System Classification:** Institutional Professional Networking & Mentorship Platform  
**Target Beneficiaries:** College Students, Graduated Alumni, College Administration / Career Development Centre (CDC)  
**Current Phase:** Phase 1 Architecture & Specifications  
**Status:** Approved for Implementation  

---

## 1. Executive Summary & Problem Statement

Colleges and universities struggle with fragmented, disorganized communication between three core stakeholder groups:
1. **Current Students:** Need vetted industry mentorship, internship referrals, technical guidance, and real-world career path visibility.
2. **Alumni:** Seek meaningful, voluntary avenues to give back to their alma mater, recruit top campus talent, reconnect with classmates, and stay informed on college milestones without being spammed or overburdened.
3. **Administration & Career Development Centre (CDC):** Need a central, authoritative, and audited governance system to track graduate outcomes, verify authentic alumni credentials, eliminate impersonation, and organize alumni meets and campus recruitment.

**Alumni Connect** provides a unified, secure, and role-segregated platform with three dedicated dashboards, a common professional design system, strict identity verification, and human-in-the-loop moderation.

---

## 2. Core Stakeholders & User Personas

| Role | Primary Identity | Key Motivations | Platform Boundary |
| :--- | :--- | :--- | :--- |
| **Student** | Enrolled undergraduate or postgraduate student with verified USN / Roll number. | Discover mentors, request 1-on-1 career guidance, apply for verified jobs/internships, participate in campus events, track placement updates. | Cannot approve other accounts, cannot post official announcements, cannot post jobs, cannot initiate unapproved direct messages to alumni. |
| **Alumni** | Verified graduate of the institution holding a recognized degree. | Volunteer career mentorship on their own schedule, hire students through referrals, reconnect with professors and batchmates, attend reunions. | Has zero mandatory obligations: mentorship, replying to messages, and posting jobs are **100% voluntary**. Cannot access administrative audit records. |
| **Admin / CDC** | Institutional authority (Deans, Placement Officers, Alumni Relations staff). | Supervise ecosystem, verify student & alumni claims, moderate suspicious activity, publish college announcements, organize events, review analytics. | Full administrative control with mandatory accountability logging and audit trails. |

---

## 3. Account Lifecycle & Verification States

To prevent fake profiles, impersonation, and unauthorized commercial access, every account transitions through explicit states:

```
  [ Registration ]
          │
          ▼
  PENDING_VERIFICATION ───( Admin Review / Auto-Match )───► VERIFIED
          │                                                    │
          ▼ (Deficient Data / Discrepancy)                     ▼ (Misconduct / Abuse)
       REJECTED                                            SUSPENDED
          │                                                    │
          └───► [ Appeal / Resubmission ] ◄────────────────────┘
```

1. **`PENDING_VERIFICATION`**:
   - Initial state upon registration.
   - User has read-only access to public landing pages, their own profile draft, and verification submission desk.
   - Cannot send mentorship requests, message requests, or apply for jobs.
2. **`VERIFIED`**:
   - Granted after successful validation of college affiliation against institutional records.
   - Full role-specific capabilities unlocked.
3. **`REJECTED`**:
   - Verification rejected by Administrator due to mismatched USN, unreadable certificates, or unverified claims.
   - User receives documented reason and instructions for resubmission/appeal.
4. **`SUSPENDED`**:
   - Account deactivated due to reported abusive behavior, spamming, or fraudulent claims.
   - Access blocked across all dashboards; user is routed to a structured Appeal submission interface.

---

## 4. Functional Requirements

### 4.1. Student Dashboard & Features

#### FR-STU-01: Registration & Academic Profile
- Students register using full name, personal/college email, password, and University Serial Number (USN) / Roll Number.
- Profile fields include: Academic department, degree (e.g., B.Tech, M.Tech, MCA, MBA), current semester, expected graduation year, CGPA, biographical summary, resume document link, GitHub link, LinkedIn URL, and portfolio link.
- Students can tag their technical and professional skills (e.g., React, System Design, Data Science) from a curated institutional skill repository.

#### FR-STU-02: Identity Verification
- Student accounts are submitted for verification with institutional email matching or college ID card upload.
- System checks USN format and matches with authorized department batch registries.
- Account status reflects verification badge upon approval.

#### FR-STU-03: Alumni Discovery & Search
- Multi-parameter search directory to filter alumni by:
  - Academic department and graduation year.
  - Current employer/company and industry sector.
  - Technical skills and mentorship topics.
  - Mentorship availability status (Only showing alumni actively accepting mentees).
- Detailed alumni profile view displaying education history, verified company role, and voluntary mentorship terms.

#### FR-STU-04: Structured Mentorship Requests
- Students can initiate a mentorship request to an alumnus who has marked their availability as "Accepting Mentees".
- **Mandatory Reason Field:** Students must specify a concrete topic/objective (e.g., "Mock System Design interview for Google SWE internship", "Resume feedback for Cloud Infrastructure role") with a detailed context message (100–500 words).
- Request state tracking: `PENDING`, `ACCEPTED`, `DECLINED`, `COMPLETED`, `CANCELLED`.
- Fair-use limit: Maximum of 3 active pending mentorship requests at any given time to prevent outbound spamming.

#### FR-STU-05: Jobs & Internships Hub
- Search and filter job/internship openings posted by verified Alumni and CDC Admins.
- Filter by job type (Full-time, Summer Internship, Part-time), location (Remote, On-site, Hybrid), and department suitability.
- 1-Click application with student profile data and uploaded resume PDF.
- Application status tracker: `APPLIED`, `UNDER_REVIEW`, `SHORTLISTED`, `REJECTED`, `OFFERED`.
- "Save Job" bookmarking feature.

#### FR-STU-06: College Announcements & Alumni Meets
- Dedicated feed of official notices from the College Administration / CDC.
- Categorized feeds: Campus Placements, Alumni Meets, Guest Lectures, Department Symposia, and Academic Calendars.
- Bookmark and download attachments (PDF guidelines, recruitment brochures).

#### FR-STU-07: Event & Webinar Registrations
- View upcoming virtual webinars, physical workshops, and campus alumni talks.
- 1-Click event registration with instant calendar (.ics) generation.
- Attendance check-in and post-event resource access.

#### FR-STU-08: Community Discussions
- Structured discussion forums segmented into channels: `#career-advice`, `#interview-prep`, `#departmental-projects`, `#campus-life`.
- Students can post questions, share insights, and upvote constructive replies from alumni.
- Anti-harassment report button on every post and comment.

#### FR-STU-09: Permitted Direct Messaging
- Students **cannot** send unsolicited direct messages to alumni.
- Once an alumnus accepts a mentorship request or an explicit message request, a private 1-on-1 communication channel is unlocked.
- File attachment support for resumes, code snippets, and design portfolios.

#### FR-STU-10: Notifications
- Real-time in-app notification badges and transactional email alerts for:
  - Mentorship request accepted/declined.
  - Job application status changed.
  - Upcoming event reminders (24 hours and 1 hour before).
  - Admin verification approval/rejection.

---

### 4.2. Alumni Dashboard & Features

#### FR-ALU-01: Professional Profile & LinkedIn OIDC Sync
- Alumni register with degree details, department, graduation year, and USN.
- Professional fields: Current employer, job title/designation, total years of experience, industry sector, current city/country, bio, and portfolio link.
- **Official LinkedIn Integration:** 1-Click authentication and profile connection using LinkedIn OAuth 2.0 / OpenID Connect (OIDC) with standard scopes (`openid`, `profile`, `email`). Zero web scraping; strict API compliance.

#### FR-ALU-02: Alumni Verification Workflow
- Alumni submit verification documents (Degree Certificate scan, Provisional Certificate, Official College Transcript, or verified LinkedIn OIDC assertion).
- Verification reviewed by CDC Admin against college convocation records.
- Verified status awards an official "Verified Alumnus" shield icon on their public card and unlocks mentorship tools.

#### FR-ALU-03: Voluntary Mentorship Control
- **Strict Voluntary Rule:** Alumni are never obligated to mentor students.
- Availability toggle switch:
  - `Accepting Mentees` (with configurable monthly quota: 1, 2, or 5 students).
  - `Mentorship Paused` (hides request button on their public profile).
- Mentorship topics specification (e.g., "Fintech Architecture", "FAANG Interviewing", "Transition to Product Management").

#### FR-ALU-04: Inbound Mentorship Review & Decision
- Inbound queue showing student name, USN, department, semester, CGPA, resume preview, and the student's written request reason.
- Alumnus can:
  - **Accept & Schedule:** Select an available time slot or provide a calendar link (Google Meet / Zoom).
  - **Decline Politely:** Provide an optional quick reason (e.g., "Full capacity this month", "Topic outside my expertise") without penalty or negative rating.
- No interaction becomes an active mentorship until explicitly accepted by the alumnus.

#### FR-ALU-05: Message Gating & Communication Protection
- Incoming message requests appear in a separate "Message Requests" holding pen.
- Alumnus can read the message preview and choose **Accept**, **Decline**, or **Block User**.
- Declining does **not** force any reply or reveal the alumnus's contact details.
- 1-Click user reporting for spam, solicitation, or inappropriate conduct.

#### FR-ALU-06: Campus Recruitment & Job Referrals (Voluntary)
- Alumni can voluntarily post job openings or referral opportunities for students and fellow alumni.
- Form fields: Role title, company name, department eligibility, minimum CGPA, location, job description, application deadline, and referral instructions.
- Dashboard to view applicant resumes, mark candidates as `Referred`, `Reviewing`, or `Closed`.
- Full authority to edit, unpublish, or delete their own postings at any time.

#### FR-ALU-07: Alumni Meets, Reunions & College Updates
- Receive verified announcements directly from the Dean of Alumni Relations / CDC.
- View and register for Alumni Reunions, Batch Silver Jubilee meets, and guest lecture series.
- Connect with other alumni across batches and global geographical chapters.

---

### 4.3. Admin / Career Development Centre (CDC) Dashboard

#### FR-ADM-01: Unified User Management
- Centralized data grid of all registered users across roles (`STUDENT`, `ALUMNI`, `ADMIN`).
- Real-time search, sorting, and filtering by: Name, email, USN, department, graduation batch, account status, and role.
- Actions:
  - View complete audit history of any account.
  - Approve or reject pending registrations.
  - Suspend suspicious or reported accounts with mandatory justification notes.
  - Restore suspended accounts upon successful resolution.

#### FR-ADM-02: Verification Management Desk
- Dedicated audit queue displaying pending student and alumni verification requests.
- Side-by-side viewer for submitted certificates, institutional roll numbers, and official convocation archives.
- **Human-in-the-Loop Decision Engine:**
  - One-click `Approve Verification`: Sets status to `VERIFIED`, assigns verified badge, dispatches email confirmation.
  - One-click `Reject Verification`: Requires selecting or writing a documented reason (e.g., "Certificate blurry", "Roll number not found in 2018 batch archive"), notifying user with appeal instructions.

#### FR-ADM-03: Platform Moderation & Trust Desk
- Central queue for all user-flagged content:
  - Reported community forum posts and comments.
  - Reported job postings (e.g., suspicious unverified third-party recruiters).
  - Reported user messages or harassment claims.
- Admin actions: Dismiss flag, delete offending content, issue warning to user, or temporarily suspend user account.

#### FR-ADM-04: Institutional Announcements & Broadcasts
- Rich-text editor to author and publish official college notices.
- Broadcast targeting:
  - All Platform Members.
  - Specific Departments (e.g., Computer Science only).
  - Specific Batches (e.g., Class of 2026 Students or Class of 2018 Alumni).
- Schedule publications and attach official university circulars.

#### FR-ADM-05: Event & Webinar Management
- Full event lifecycle management: Create, update, reschedule, or cancel webinars, alumni reunions, and campus placement drives.
- Monitor live attendee registration lists, export CSV attendance rosters, and dispatch reminder broadcasts.

#### FR-ADM-06: Placement & Mentorship Analytics
- Real-time visual metrics:
  - Student enrollment by department and graduation year.
  - Verified alumni distribution by country, employer, and industry.
  - Mentorship connection success rates (Requests sent vs. accepted vs. completed).
  - Job referral conversion rates and placement statistics.
- Exportable PDF and CSV reports for university accreditation committees (e.g., NAAC, NBA, ABET).

#### FR-ADM-07: Administrative Accountability & Audit Logs
- Immutable audit log tracking every sensitive action:
  - Timestamp (UTC).
  - Administrator User ID, name, and designation.
  - Target Entity (User, Post, Job, Verification).
  - Action performed (VERIFY_APPROVE, VERIFY_REJECT, ACCOUNT_SUSPEND, ACCOUNT_RESTORE, CONTENT_DELETE).
  - Documented justification notes.
- Double-confirmation modal required for destructive or punitive actions (e.g., suspending accounts or deleting jobs).

---

## 5. Fake Profile Detection & Verification Architecture

### 5.1. Multi-Layer Verification Strategy
To ensure that bad actors or commercial recruiters cannot impersonate college alumni or students, Alumni Connect enforces a 3-tier validation framework:

1. **Email Domain Tier:** Automatic matching against institutional domains (e.g., `@university.edu`, `@alumni.university.edu`).
2. **Academic Archive Tier:** Matching claimed USN, graduation year, and degree against authorized college records.
3. **Evidence Inspection Tier:** Inspection of uploaded convocation certificates, marksheets, or official LinkedIn OpenID assertions by designated CDC staff.

### 5.2. Anomaly & Suspicion Scoring (Assistive Only)
The system calculates an internal, non-punitive **Suspicion Score (0–100)** to flag accounts for priority human inspection:
- +30: Non-institutional personal email (e.g., disposable temp mail).
- +25: USN format does not match college departmental convention.
- +25: Graduation year is in the past, but user registered as a Student.
- +40: High velocity outbound connection or message requests within 10 minutes of account creation.

> **CRITICAL RULE:** The suspicion score **never** automatically bans or suspends any user. It only surfaces the account to the Admin Verification Queue for human review.

### 5.3. Due Process, Rejection Justification & Appeals
- Any rejected verification or suspended account must have a written justification recorded in the database.
- Suspended or rejected users are routed to a dedicated appeal form (`/appeal`) where they can submit explanatory statements and supplemental identity documents.
- Administrative audit logs record both the original rejection and the appeal verdict.

---

## 6. Non-Functional Requirements (NFRs)

### 6.1. Security & Compliance
- **Authentication:** JSON Web Tokens (JWT) signed with HMAC-SHA256, expiration enforced (7 days), stored securely with HTTPS cookie support.
- **Password Hashing:** Passwords hashed with `bcryptjs` using a salt work factor of 10.
- **Input Validation:** 100% of API ingress data validated using strict `Zod` schemas before touching controllers or database queries.
- **Network Security:** Secure HTTP response headers managed via `helmet`, CORS strictly locked to authorized client origins.
- **Relational Integrity:** Zero MongoDB/NoSQL usage. All transactions executed through MySQL 8 InnoDB with strict foreign key constraints and atomic Prisma transactions.

### 6.2. Performance & Latency
- Primary API endpoints must respond in **< 150ms** under normal load.
- Database queries must execute in **< 30ms** via indexed foreign keys and composite unique indexes.
- Frontend initial render (First Contentful Paint) in **< 1.2s** using Vite bundle splitting.

### 6.3. Reliability & Observability
- Backend server must support **independent diagnostic health probes** (`GET /api/health`), checking Node process uptime and executing a `SELECT 1` ping against MySQL separately.
- In degraded database mode, public marketing pages remain accessible and users receive descriptive degradation notifications instead of generic crashes.

### 6.4. Design & Usability
- Professional UI adhering strictly to institutional aesthetics: Deep Navy Blue (`#0F2744`), Blue interactive accents (`#2563EB`), Slate backgrounds (`#F8FAFC`), and clean card elevation.
- Zero excessive AI-style neon gradients.
- Fully responsive across mobile (375px+), tablet (768px+), and desktop (1280px+).
- Accessible contrast ratios conforming to WCAG 2.1 AA standards.

---

## 7. Phase 1 Deliverables Summary

1. Monorepo architecture with clean workspace separation (`client` and `server`).
2. Express + TypeScript backend with Zod validation, error handling, and health diagnostics.
3. MySQL 8 database configured with Prisma ORM, migrations, and realistic seed data.
4. React + Vite + TypeScript frontend with Tailwind CSS design system.
5. Role-specific dashboards for Students, Alumni, and Admin.
6. Complete architectural and requirements documentation inside `docs/`.
