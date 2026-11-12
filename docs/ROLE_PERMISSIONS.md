# Alumni Connect — Role-Based Access Control (RBAC) & Permissions Specification

**Document Version:** 1.0  
**Classification:** Security Architecture & Access Control  
**Applies To:** Frontend Route Guards, Backend API Middleware, Database Policies  

---

## 1. Role Definitions & Hierarchy

Alumni Connect enforces strict Role-Based Access Control (RBAC) supplemented by Account Verification State gating. The system recognizes five authorization identities:

```
[ GUEST / PUBLIC ]
       │ (Authentication)
       ▼
   [ USER ]
   ├── STUDENT  (Gated by StudentProfile & Verification Status)
   ├── ALUMNI   (Gated by AlumniProfile & Verification Status)
   └── ADMIN    (Gated by AdminProfile & Permission Claims)
```

1. **`GUEST` (Unauthenticated):**
   - Public visitors browsing marketing landing pages, platform features, institutional information, and public health checks.
2. **`STUDENT`:**
   - Enrolled undergraduate or graduate students verified through USN and departmental records.
3. **`ALUMNI`:**
   - Graduated alumni verified through institutional records or official LinkedIn OpenID Connect assertions.
4. **`ADMIN` (CDC Staff / Faculty):**
   - College administrators, Career Development Centre officers, and Dean of Alumni Affairs.
5. **`SYSTEM` (Internal / Daemon):**
   - Automated jobs for health monitoring, verification email triggers, and scheduled event reminders.

---

## 2. Verification State Permissions Gate

Permissions are evaluated in two sequential layers:
1. **Role Layer:** Is the user a `STUDENT`, `ALUMNI`, or `ADMIN`?
2. **State Layer:** Is the user's account state `VERIFIED`, `PENDING_VERIFICATION`, `REJECTED`, or `SUSPENDED`?

| Verification State | Public Access | Own Profile Draft | Submit Verification | Send Mentorship Requests | Apply to Jobs | Post Jobs | Admin Desk |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`PENDING_VERIFICATION`** | ✅ | ✅ (Edit Draft) | ✅ (Upload docs) | ❌ Read-only | ❌ View only | ❌ | ❌ |
| **`VERIFIED`** | ✅ | ✅ | ✅ (Resync) | ✅ Full Access | ✅ Full Access | ✅ (Alumni/Admin) | ❌ (Except Admin) |
| **`REJECTED`** | ✅ | ✅ (View/Edit) | ✅ (Resubmit Docs) | ❌ Blocked | ❌ Blocked | ❌ Blocked | ❌ |
| **`SUSPENDED`** | ❌ Blocked | ❌ Blocked | ❌ (Appeal only) | ❌ Blocked | ❌ Blocked | ❌ Blocked | ❌ |

---

## 3. Comprehensive Permissions Matrix

The matrix below explicitly delineates actions across all system modules:
- **`VIEW`**: Read entity details.
- **`CREATE`**: Instantiate a new record.
- **`UPDATE`**: Modify an existing record.
- **`APPROVE`**: Grant verified or authorized status.
- **`REJECT`**: Decline or reject a pending submission.
- **`DELETE`**: Soft-delete or purge a record.
- **`SUSPEND`**: Deactivate an entity.

### 3.1. User Accounts & Profiles

| Resource / Action | GUEST | STUDENT | ALUMNI | ADMIN | Enforcement Policy |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **View Public Landing & Directory Preview** | ✅ | ✅ | ✅ | ✅ | Public route |
| **Register New Account** | ✅ | ❌ | ❌ | ❌ | Zod input schema validation |
| **View Own Account & Profile** | ❌ | ✅ | ✅ | ✅ | Self ownership or Admin |
| **Update Own Profile Data** | ❌ | ✅ (Own) | ✅ (Own) | ✅ (Own) | Self ownership |
| **View Other Users' Public Profiles** | ❌ | ✅ (Verified only) | ✅ (Verified only) | ✅ (All) | Gated to verified members |
| **View Sensitive Contact Info (Email, Phone)** | ❌ | ❌ | ❌ | ✅ | Redacted unless connection accepted |
| **Suspend User Account** | ❌ | ❌ | ❌ | ✅ | Requires Admin role + logged reason |
| **Restore Suspended Account** | ❌ | ❌ | ❌ | ✅ | Requires Admin role + audit log |
| **Delete User Account** | ❌ | ✅ (Own deletion) | ✅ (Own deletion) | ✅ | Self or Super Admin |

---

### 3.2. Verification & Institutional Auditing

| Resource / Action | GUEST | STUDENT | ALUMNI | ADMIN | Enforcement Policy |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Submit Verification Documents** | ❌ | ✅ (Own) | ✅ (Own) | ❌ | Gated to user's own profile |
| **View Own Verification Status & Notes** | ❌ | ✅ | ✅ | ✅ | Self ownership |
| **View Admin Verification Queue** | ❌ | ❌ | ❌ | ✅ | Restricted to Admin |
| **Approve Alumni / Student Verification** | ❌ | ❌ | ❌ | ✅ | Admin only; records admin ID & timestamp |
| **Reject Verification (with reason)** | ❌ | ❌ | ❌ | ✅ | Admin only; mandatory reason field |
| **Submit Appeal on Rejection / Suspension** | ❌ | ✅ (Own) | ✅ (Own) | ❌ | Gated to rejected/suspended user |
| **Review & Resolve Appeal** | ❌ | ❌ | ❌ | ✅ | Admin only |

---

### 3.3. Mentorship Workflow

| Resource / Action | GUEST | STUDENT | ALUMNI | ADMIN | Enforcement Policy |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Browse Mentors Directory** | ❌ | ✅ (Verified) | ✅ (Verified) | ✅ | Must be verified member |
| **Send Mentorship Request** | ❌ | ✅ (Max 3 pending) | ❌ | ❌ | Student only; target alumnus must be open |
| **View Inbound Mentorship Requests** | ❌ | ❌ | ✅ (Own queue) | ✅ (Audit view) | Alumnus sees own inbound requests |
| **Accept Mentorship Request** | ❌ | ❌ | ✅ (Own) | ❌ | Alumnus voluntary authority |
| **Decline Mentorship Request** | ❌ | ❌ | ✅ (Own) | ❌ | Alumnus voluntary authority; no penalty |
| **Cancel Outbound Mentorship Request** | ❌ | ✅ (Own pending) | ❌ | ❌ | Student can cancel before acceptance |
| **Set Mentorship Availability / Capacity** | ❌ | ❌ | ✅ (Own) | ❌ | Alumnus manages own toggle & spots |
| **View Confirmed Session Details** | ❌ | ✅ (Participant) | ✅ (Participant) | ✅ (Audit view) | Restricted to participants |

---

### 3.4. Messaging & Connections

| Resource / Action | GUEST | STUDENT | ALUMNI | ADMIN | Enforcement Policy |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Send Inbound Message Request** | ❌ | ✅ (To Alumni) | ✅ (To Alumni) | ✅ (Official notices) | Unlocks holding queue; not direct inbox |
| **View Inbound Message Requests** | ❌ | ✅ | ✅ | ✅ | Recipient only |
| **Accept Message Request** | ❌ | ✅ | ✅ | ✅ | Unlocks bidirectional chat |
| **Decline Message Request** | ❌ | ✅ | ✅ | ✅ | Discards request; no reply forced |
| **Send Messages in Active Channel** | ❌ | ✅ (Participant) | ✅ (Participant) | ✅ (Participant) | Channel participants only |
| **Block / Report Offending User** | ❌ | ✅ | ✅ | ✅ | Immediately suppresses contact & flags |

---

### 3.5. Jobs & Internships Hub

| Resource / Action | GUEST | STUDENT | ALUMNI | ADMIN | Enforcement Policy |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **View Published Job Postings** | ❌ | ✅ (Verified) | ✅ (Verified) | ✅ | Verified members only |
| **Create / Post Job or Internship** | ❌ | ❌ | ✅ (Voluntary) | ✅ (CDC Postings) | Alumni and Admin only |
| **Update Own Job Posting** | ❌ | ❌ | ✅ (Own) | ✅ (Any posting) | Job owner or Admin |
| **Delete / Close Own Job Posting** | ❌ | ❌ | ✅ (Own) | ✅ (Any posting) | Job owner or Admin |
| **Apply for Job / Internship** | ❌ | ✅ (Verified Student)| ❌ | ❌ | Students only; requires uploaded resume |
| **View Applications for a Job** | ❌ | ❌ | ✅ (Own job) | ✅ (CDC access) | Job creator or Admin |
| **Update Application Status** | ❌ | ❌ | ✅ (Own job) | ✅ (CDC access) | Shortlist, Reject, Mark Hired |
| **Save / Bookmark Job** | ❌ | ✅ | ✅ | ❌ | Personal bookmark repository |

---

### 3.6. College Announcements & Campus Events

| Resource / Action | GUEST | STUDENT | ALUMNI | ADMIN | Enforcement Policy |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **View Official College Announcements** | ❌ | ✅ | ✅ | ✅ | Platform-wide read access |
| **Create / Publish Announcement** | ❌ | ❌ | ❌ | ✅ | Admin only |
| **Update / Unpublish Announcement** | ❌ | ❌ | ❌ | ✅ | Admin only |
| **Delete Announcement** | ❌ | ❌ | ❌ | ✅ | Admin only |
| **View Upcoming Events & Webinars** | ❌ | ✅ | ✅ | ✅ | Platform-wide read access |
| **Create Campus Event / Webinar** | ❌ | ❌ | ❌ | ✅ | Admin only |
| **Register for Event** | ❌ | ✅ | ✅ | ✅ | Registered member |
| **Cancel Own Event Registration** | ❌ | ✅ (Own) | ✅ (Own) | ✅ (Own) | Self ownership |
| **Export Event Attendance Roster** | ❌ | ❌ | ❌ | ✅ | Admin only (CSV / PDF export) |

---

### 3.7. Community Forums & Platform Moderation

| Resource / Action | GUEST | STUDENT | ALUMNI | ADMIN | Enforcement Policy |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Read Community Discussions** | ❌ | ✅ (Verified) | ✅ (Verified) | ✅ | Verified members only |
| **Create Discussion Thread** | ❌ | ✅ (Verified) | ✅ (Verified) | ✅ | Verified members only |
| **Post Comment on Thread** | ❌ | ✅ (Verified) | ✅ (Verified) | ✅ | Verified members only |
| **Edit Own Post / Comment** | ❌ | ✅ (Own) | ✅ (Own) | ✅ (Own) | Author only |
| **Delete Own Post / Comment** | ❌ | ✅ (Own) | ✅ (Own) | ✅ (Own) | Author or Admin |
| **Report Post / Comment for Abuse** | ❌ | ✅ | ✅ | ✅ | Surfaces item to moderation queue |
| **View Moderation Queue** | ❌ | ❌ | ❌ | ✅ | Admin only |
| **Delete Abusive Post (Moderator Action)**| ❌ | ❌ | ❌ | ✅ | Admin only; recorded in audit log |

---

### 3.8. Platform Analytics & Administrative Accountability

| Resource / Action | GUEST | STUDENT | ALUMNI | ADMIN | Enforcement Policy |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **View System Health (`/api/health`)** | ✅ (Public) | ✅ | ✅ | ✅ | Unauthenticated diagnostic endpoint |
| **View Detailed Telemetry & Memory** | ❌ | ❌ | ❌ | ✅ | Admin Dashboard widget |
| **View Placement & Mentorship Analytics**| ❌ | ❌ | ❌ | ✅ | Aggregated data for CDC |
| **Export Institutional Accreditation Reports**| ❌ | ❌ | ❌ | ✅ | NAAC/NBA compliance exports |
| **View System Audit Logs** | ❌ | ❌ | ❌ | ✅ | Admin only; immutable logs |
| **Clear / Delete Audit Logs** | ❌ | ❌ | ❌ | ❌ | **FORBIDDEN (Immutable log rule)** |

---

## 4. Backend Middleware Authorization Enforcement

All API endpoints enforce permissions via composable Express middleware chain:

```typescript
// Example Route Definition
router.post(
  '/api/mentorship/requests',
  requireAuth,                  // 1. Validates JWT signature & expiration
  requireAccountState('VERIFIED'), // 2. Verifies account is not PENDING, REJECTED, or SUSPENDED
  requireRole(['STUDENT']),     // 3. Verifies user role is STUDENT
  validate(createMentorshipSchema), // 4. Validates Zod request body
  MentorshipController.createRequest // 5. Executes business logic
);
```

### 4.1. Core Middleware Definitions

1. **`requireAuth`**:
   - Inspects `Authorization: Bearer <token>` or secure HTTP-only session cookie.
   - Decodes JWT payload: `{ userId, role, email, isVerified }`.
   - Rejects missing/expired tokens with `401 Unauthorized`.
2. **`requireRole(allowedRoles: UserRole[])`**:
   - Verifies `req.user.role` is present in `allowedRoles`.
   - Rejects unauthorized roles with `403 Forbidden` (`FORBIDDEN_ROLE`).
3. **`requireAccountState(requiredState: VerificationStatus)`**:
   - Queries user's verification state.
   - Rejects unverified accounts with `403 Forbidden` (`ACCOUNT_NOT_VERIFIED` or `ACCOUNT_SUSPENDED`).
4. **`requireOwnershipOrAdmin(getEntityOwnerId: (req) => Promise<string>)`**:
   - Compares authenticated `req.user.userId` with the owner ID of the target resource.
   - Grants access if IDs match OR if `req.user.role === 'ADMIN'`.
   - Rejects unauthorized updates with `403 Forbidden` (`OWNERSHIP_REQUIRED`).

---

## 5. Security Invariants & Protected Principles

1. **Alumni Voluntary Sovereignty:**
   - No automated algorithm, administrator rule, or student action can force an alumnus to mentor, reply, or post jobs.
   - An alumnus may decline 100% of mentorship and message requests without their account score, profile rank, or visibility being degraded.
2. **Student Identity Authenticity:**
   - Students cannot spoof USNs or departments; all claims are checked against registrar archives.
3. **Audit Immutability:**
   - Administrative action records cannot be modified or deleted, even by Administrators themselves.
4. **Zero Client-Side Reliance:**
   - Hiding a button or dashboard tab on the frontend is considered a UI convenience, **not** security. Every single mutation and sensitive query is strictly enforced on the Express backend.
