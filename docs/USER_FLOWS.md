# Alumni Connect — End-to-End User Flows & Interaction Workflows

**Document Version:** 1.0  
**Classification:** Product Experience & Operational Workflows  
**Target Audience:** Frontend Engineers, Backend Engineers, QA Testers, Product Designers  

---

## Table of Contents

1. [Flow 1: Student Registration & Verification](#flow-1-student-registration--verification)
2. [Flow 2: Alumni Registration & Verification](#flow-2-alumni-registration--verification)
3. [Flow 3: Admin Review, Approval & Rejection](#flow-3-admin-review-approval--rejection)
4. [Flow 4: Mentorship Request & Decision Lifecycle](#flow-4-mentorship-request--decision-lifecycle)
5. [Flow 5: Message Request & Communication Gating](#flow-5-message-request--communication-gating)
6. [Flow 6: Job Posting & Application Lifecycle](#flow-6-job-posting--application-lifecycle)
7. [Flow 7: Campus Event Creation & Attendance](#flow-7-campus-event-creation--attendance)
8. [Flow 8: Account Suspension & Due Process Appeal](#flow-8-account-suspension--due-process-appeal)

---

## Flow 1: Student Registration & Verification

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student Applicant
    participant Client as Frontend (React / Vite)
    participant Server as Backend API (Express)
    participant DB as MySQL 8 (Prisma)
    participant Admin as CDC / College Admin

    Student->>Client: Navigates to /register?role=STUDENT
    Student->>Client: Enters Name, Email, Password, USN/Roll No, Department, Expected Batch
    Client->>Client: Validates form input & USN format pattern
    Client->>Server: POST /api/auth/register (role: STUDENT)
    Server->>DB: Check email & USN uniqueness
    alt Duplicate Email or USN
        Server-->>Client: 409 Conflict ("Email or USN already registered")
        Client-->>Student: Displays error banner
    else Credentials Unique
        Server->>Server: Hash password with bcryptjs (salt factor 10)
        Server->>DB: Transaction: Create User & StudentProfile (status: PENDING_VERIFICATION)
        Server-->>Client: 201 Created + JWT Token
        Client->>Student: Redirects to /dashboard/student (Limited Mode)
        Student->>Client: Submits College ID Card / Marksheet for verification
        Client->>Server: POST /api/verification/student (Document URL)
        Server->>DB: Record verification submission
        Server-->>Admin: Surfaces to Admin Verification Queue
    end
```

### Flow Details
- **Preconditions:** Student is not already registered.
- **Initial State:** `PENDING_VERIFICATION`.
- **Experience in Limited Mode:** Student can view public campus notices, edit their own profile bio and skills, but cannot initiate mentorship requests or apply for jobs.
- **Postconditions:** Account is queued in the Administration Verification Desk.

---

## Flow 2: Alumni Registration & Verification

```mermaid
sequenceDiagram
    autonumber
    actor Alumni as Alumnus Member
    participant Client as Frontend (React / Vite)
    participant Server as Backend API (Express)
    participant LinkedIn as LinkedIn OIDC
    participant DB as MySQL 8 (Prisma)

    Alumni->>Client: Navigates to /register?role=ALUMNI
    Alumni->>Client: Enters Name, Email, Degree, Department, Batch Year, Company, Designation
    opt Connect with LinkedIn
        Alumni->>Client: Clicks "Connect LinkedIn"
        Client->>Server: GET /api/linkedin/auth-url
        Server-->>Client: Returns OAuth URL + State
        Client->>LinkedIn: Redirects to LinkedIn OpenID Consent
        LinkedIn-->>Server: Callback with Auth Code
        Server->>LinkedIn: Exchange Code for Access Token & /userinfo
        Server->>DB: Upsert LinkedAccount record
    end
    Alumni->>Client: Uploads Degree Certificate / Transcript PDF
    Client->>Server: POST /api/verification/alumni (Document URL, batch year)
    Server->>DB: Create AlumniVerification record (status: PENDING)
    Server-->>Client: 201 Created (Alumni Dashboard unlocked in Preview Mode)
    Client-->>Alumni: Banner: "Verification Pending Administrative Review"
```

### Flow Details
- **Preconditions:** Alumnus graduated from the college.
- **Voluntary Rule:** Alumnus specifies whether they want to mentor students (`isWillingToMentor: true/false`) and their monthly mentee capacity (e.g., 2 students/month).
- **Postconditions:** Verification record created in `AlumniVerification` with `PENDING` status.

---

## Flow 3: Admin Review, Approval & Rejection

```mermaid
sequenceDiagram
    autonumber
    actor Admin as CDC / College Admin
    participant Client as Admin Dashboard (/dashboard/admin)
    participant Server as Backend API (Express)
    participant DB as MySQL 8 (Prisma)
    participant Email as Email Service (Nodemailer)

    Admin->>Client: Opens Admin Verification Desk
    Client->>Server: GET /api/admin/verifications?status=PENDING
    Server->>DB: Query pending AlumniVerification and Student records
    Server-->>Client: Returns list with applicant metadata & document URLs
    Admin->>Client: Inspects submitted Degree Certificate alongside Convocation Archive

    alt Documents Valid & Matched
        Admin->>Client: Clicks "Approve Verification"
        Client->>Server: PATCH /api/admin/verifications/:id/approve
        Server->>DB: Transaction: Set status = APPROVED, AlumniProfile.isVerified = true
        Server->>DB: Write AuditLog (Action: VERIFY_APPROVE, AdminId, TargetId)
        Server->>Email: Send "Welcome to Alumni Connect as a Verified Alumnus"
        Server-->>Client: 200 OK
        Client-->>Admin: Table updates, applicant badge turns to "VERIFIED"
    else Document Illegible or Discrepancy Found
        Admin->>Client: Clicks "Reject Verification"
        Client->>Client: Opens modal: Requires documented rejection reason
        Admin->>Client: Enters reason ("Convocation year does not match institutional archive")
        Admin->>Client: Confirms Rejection
        Client->>Server: PATCH /api/admin/verifications/:id/reject { reason }
        Server->>DB: Transaction: Set status = REJECTED, record reviewNotes
        Server->>DB: Write AuditLog (Action: VERIFY_REJECT, AdminId, Reason)
        Server->>Email: Send notification with rejection reason & appeal link
        Server-->>Client: 200 OK
        Client-->>Admin: Item removed from pending queue
    end
```

### Flow Details
- **Accountability Constraint:** Every administrative action requires an immutable `AuditLog` entry.
- **Rejection Mandate:** No rejection can be submitted without a documented reason.

---

## Flow 4: Mentorship Request & Decision Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student (Verified)
    participant Client as Student Portal
    participant Server as Backend API
    participant DB as MySQL 8 (Prisma)
    actor Alumni as Alumnus (Verified)

    Student->>Client: Searches Alumni directory (Filter: "Accepting Mentees")
    Student->>Client: Views Sarah Chen's profile (Staff SWE at Google)
    Student->>Client: Clicks "Request Mentorship"
    Client->>Client: Opens request modal (Mandatory Topic & Detailed Reason)
    Student->>Client: Fills Topic ("System Design Interview") & Reason (150 words)
    Client->>Server: POST /api/mentorship/requests { alumniId, topic, reason }
    Server->>DB: Check student active request count (< 3 active)
    Server->>DB: Check alumni availability (isWillingToMentor == true)
    Server->>DB: Insert MentorshipRequest (status: PENDING)
    Server->>Alumni: Dispatches In-App & Email Notification
    Server-->>Client: 201 Created

    Alumni->>Client: Opens Alumni Dashboard (/dashboard/alumni)
    Alumni->>Client: Inspects Inbound Request (Student USN, CGPA, Resume, Reason)

    alt Alumnus Accepts (Voluntary)
        Alumni->>Client: Clicks "Accept & Propose Slot"
        Alumni->>Client: Enters meeting date/time and Google Meet link
        Client->>Server: PATCH /api/mentorship/requests/:id/accept { scheduledAt, meetingUrl }
        Server->>DB: Update status = ACCEPTED, record meeting details
        Server->>Student: Notification: "Mentorship confirmed for Friday at 5 PM"
        Server-->>Client: 200 OK
    else Alumnus Declines (Voluntary)
        Alumni->>Client: Clicks "Decline"
        opt Optional Reason
            Alumni->>Client: Enters reason ("Currently reached monthly capacity")
        end
        Client->>Server: PATCH /api/mentorship/requests/:id/decline { reason }
        Server->>DB: Update status = DECLINED
        Server->>Student: Polite notification: "Request could not be accommodated"
        Server-->>Client: 200 OK
    end
```

### Flow Details
- **Voluntary Rule:** Alumnus has 100% voluntary discretion. Declining incurs zero platform penalties.
- **No Unsolicited Inboxes:** Request remains quarantined until explicitly accepted.

---

## Flow 5: Message Request & Communication Gating

```mermaid
sequenceDiagram
    autonumber
    actor Sender as Initiating Member
    participant Client as Client Application
    participant Server as Backend API
    participant DB as MySQL 8 (Prisma)
    actor Receiver as Target Member (Alumni)

    Sender->>Client: Clicks "Send Message Request" on profile
    Client->>Client: Modal: Enter introductory message (max 250 characters)
    Sender->>Client: Submits introduction
    Client->>Server: POST /api/messages/requests { recipientId, introduction }
    Server->>DB: Check if existing request or block exists
    Server->>DB: Create MessageRequest (status: PENDING)
    Server-->>Receiver: Dispatches notification: "New Message Request"
    Server-->>Client: 201 Created ("Request sent")

    Receiver->>Client: Opens "Message Requests" tab
    Receiver->>Client: Reads introductory context

    alt Receiver Accepts
        Receiver->>Client: Clicks "Accept"
        Client->>Server: PATCH /api/messages/requests/:id/accept
        Server->>DB: Set status = ACCEPTED, initialize ChatChannel
        Server-->>Client: Direct 1-on-1 messaging channel unlocked
    else Receiver Declines
        Receiver->>Client: Clicks "Decline"
        Client->>Server: PATCH /api/messages/requests/:id/decline
        Server->>DB: Set status = DECLINED
        Note over Receiver,Server: No reply forced, contact info remains private
    else Receiver Blocks User
        Receiver->>Client: Clicks "Block User"
        Client->>Server: POST /api/users/block { targetUserId, reason }
        Server->>DB: Create UserBlock record & discard request
        Server-->>Client: User blocked successfully
    end
```

---

## Flow 6: Job Posting & Application Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Poster as Alumnus or CDC Admin
    participant Client as Job Hub
    participant Server as Backend API
    participant DB as MySQL 8 (Prisma)
    actor Student as Student Applicant

    Poster->>Client: Clicks "Post Job / Referral"
    Poster->>Client: Fills Title, Company, Job Type, Location, CGPA cut-off, Description
    Client->>Server: POST /api/jobs { jobData }
    Server->>DB: Insert JobPosting (status: ACTIVE)
    Server-->>Client: 201 Created (Posting live on campus feed)

    Student->>Client: Discovers job posting in Jobs & Internships Hub
    Student->>Client: Clicks "Apply Now"
    Client->>Client: Prefills student profile, selects resume PDF, adds cover note
    Student->>Client: Submits application
    Client->>Server: POST /api/jobs/:id/apply { resumeUrl, coverNote }
    Server->>DB: Insert JobApplication (status: APPLIED)
    Server-->>Poster: Notification: "New Student Application Received"
    Server-->>Student: 201 Created ("Application submitted")

    Poster->>Client: Opens Job Management view
    Poster->>Client: Reviews applicant resumes and updates status to SHORTLISTED
    Client->>Server: PATCH /api/jobs/applications/:appId { status: "SHORTLISTED" }
    Server->>DB: Update JobApplication status
    Server->>Student: Notification: "You have been shortlisted for interview"
```

---

## Flow 7: Campus Event Creation & Attendance

```mermaid
sequenceDiagram
    autonumber
    actor Admin as College Admin / CDC
    participant Client as Admin Portal
    participant Server as Backend API
    participant DB as MySQL 8 (Prisma)
    actor Member as Student / Alumni

    Admin->>Client: Navigates to Event Management
    Admin->>Client: Enters Title ("Annual Alumni Leadership Summit"), Date, Venue, Virtual Link
    Client->>Server: POST /api/events { eventData }
    Server->>DB: Insert CampusEvent record
    Server->>DB: Trigger Announcement broadcast to target batches
    Server-->>Client: 201 Created

    Member->>Client: Browses Upcoming Events in Dashboard
    Member->>Client: Clicks "Register for Event"
    Client->>Server: POST /api/events/:id/register
    Server->>DB: Check event capacity
    Server->>DB: Insert EventRegistration record
    Server-->>Client: Returns confirmation + downloadable .ics calendar invite

    Note over Admin,Server: Event Day: Admin marks attendance or scans QR check-in
    Admin->>Client: Marks attendance in Admin Desk
    Client->>Server: PATCH /api/events/:id/attendees/:userId { attended: true }
    Server->>DB: Update EventRegistration.attended = true
```

---

## Flow 8: Account Suspension & Due Process Appeal

```mermaid
sequenceDiagram
    autonumber
    actor Reporter as User / System Flag
    participant Server as Backend API
    participant DB as MySQL 8 (Prisma)
    actor Admin as College Admin
    actor Suspended as Suspended User

    Reporter->>Server: Reports abusive conduct or suspicious profile
    Server->>DB: Create AbuseReport, increment anomaly score
    Server-->>Admin: Surfaces to Moderation Queue

    Admin->>Admin: Reviews submitted evidence manually (Human-in-the-Loop)
    alt Action Warranted
        Admin->>Server: POST /api/admin/users/:userId/suspend { reason, duration }
        Server->>DB: Set User.isActive = false, status = SUSPENDED
        Server->>DB: Write AuditLog (Action: ACCOUNT_SUSPEND, AdminId, Reason)
        Server->>Suspended: Sends formal Suspension Notice with specific reason
    end

    Suspended->>Server: Attempts login; redirected to /appeal
    Suspended->>Server: Submits appeal statement and supplemental identification
    Server->>DB: Insert AccountAppeal record (status: PENDING)
    Server-->>Admin: Surfaces to Appeals Queue

    Admin->>Admin: Evaluates appeal statement and verified college documents
    alt Appeal Granted
        Admin->>Server: POST /api/admin/appeals/:id/restore { justification }
        Server->>DB: Set User.isActive = true, status = VERIFIED
        Server->>DB: Write AuditLog (Action: ACCOUNT_RESTORE, AdminId, Justification)
        Server->>Suspended: Dispatches "Account Restored" confirmation email
    else Appeal Denied
        Admin->>Server: POST /api/admin/appeals/:id/deny { finalVerdict }
        Server->>DB: Update AccountAppeal.status = REJECTED
        Server->>Suspended: Dispatches final verdict notification
    end
```

### Flow Details
- **Zero Automated Bans:** Automated algorithms only flag accounts for administrative review; they **never** execute an irreversible ban without human sign-off.
- **Fair Due Process:** Suspended users are always informed of the specific rule violation and given a dedicated path to submit an appeal.
