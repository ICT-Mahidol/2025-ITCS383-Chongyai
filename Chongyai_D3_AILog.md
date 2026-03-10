# Chongyai Job Center Management System - AI Development Log

**Project:** ITCS383-D3 Group: Chongyai  
**Course:** Software Engineering 2025  
**Deadline:** 11 March 2026  
**Status:** ✅ D2 Implementation Complete

---

## 📋 Project Overview

Full-stack Job Center Management System with three user roles:

- **Applicant** - Search jobs, apply, track applications
- **Recruiter** - Post jobs, manage applicants, schedule interviews
- **Admin** - View reports, manage users and payments

### Tech Stack

| Layer          | Technology                                         |
| -------------- | -------------------------------------------------- |
| **Frontend**   | Next.js 14+ (App Router, TypeScript, Tailwind CSS) |
| **Backend**    | Express.js (TypeScript)                            |
| **Database**   | PostgreSQL 15 + Prisma ORM                         |
| **Auth**       | JWT (jsonwebtoken + bcryptjs)                      |
| **Validation** | Zod (frontend & backend)                           |
| **UI Theme**   | Orange & yellow palette, rounded corners           |

---

## 🗂️ Implementation Timeline

### Phase 1: Backend Foundation ✅

**Files Created:**

- `backend/package.json` + `tsconfig.json` + `.env.example`
- `backend/src/prisma/schema.prisma` - 12 models with full relations
- `backend/src/lib/` - prisma.ts, jwt.ts, password.ts, response.ts
- `backend/src/types/express.d.ts` - TypeScript augmentations
- `backend/src/middleware/` - auth, validate, error handlers
- `backend/src/routes/auth.routes.ts` + `index.ts`

### Phase 2: Backend Routes (13 Modules) ✅

All route modules implemented:

1. **auth** - JWT registration/login for 3 roles
2. **users** - Profile management
3. **jobs** - CRUD + view count logic
4. **search** - Filter by type, location, salary
5. **applications** - Status workflow (Applied → Interviewing → Accepted/Rejected)
6. **interviews** - Scheduling with time slots
7. **bookmarks** - Save/unsave jobs
8. **recommendations** - Skill-based matching
9. **reports** - Admin dashboard stats
10. **verifications** - Mock MOI API (Thai ID checksum)
11. **payments** - Mock Banking API (500 THB / 5,000 THB)
12. **chat** - Bot + human support toggle (9:00-17:00)
13. **conference** - Video interview simulation

### Phase 3: Frontend Foundation ✅

**Files Created:**

- `frontend/package.json` + `tsconfig.json`
- `frontend/tailwind.config.ts` + `postcss.config.js`
- `frontend/next.config.ts` → `next.config.mjs`
- `frontend/src/types/index.ts` - Shared TypeScript interfaces
- `frontend/src/lib/api.ts` + `auth.ts` - API client & helpers
- `frontend/src/context/AuthContext.tsx` - Auth state management
- `frontend/src/middleware.ts` - Route guards

### Phase 4: UI Components ✅

**Atomic Components:**

- Button, Input, Select, Badge, Spinner

**Composite Components:**

- Card, Modal, Pagination

**Layout Components:**

- Navbar, Sidebar, Footer, DashboardLayout

### Phase 5: Feature Components & Pages ✅

**Feature Components:**

- `jobs/` - JobCard, JobFilter, JobForm
- `applications/` - ApplicationCard
- `chat/` - ChatWindow, ChatMessage
- `conference/` - ConferenceRoom
- `dashboard/` - StatsCard, ChartPlaceholder

**Pages Created:**

- Landing page (orange/yellow gradient hero)
- Auth pages (login/register)
- Applicant dashboard (7 pages)
- Recruiter dashboard (7 pages)
- Admin dashboard (5 pages)
- Chat & Conference pages

### Phase 6: Polish & Documentation ✅

- Root README.md updated with full instructions
- 3 `.gitignore` files added (root, backend, frontend)
- Database migrations configured

---

## 📊 Database Schema

### Core Models

```
User
├── id, email (unique), passwordHash
├── role: APPLICANT | RECRUITER | ADMIN
├── firstName, lastName, phone?
├── citizenId?, isVerified, isPaid
└── profileImageUrl?, createdAt, updatedAt

ApplicantProfile
├── userId (FK), resumeUrl?
├── skills String[], experience?
├── education?, preferredLocation?
└── preferredSalaryMin?, preferredSalaryMax?

RecruiterProfile
├── userId (FK), companyName
├── companyDescription?, website?, industry?

Job
├── id, recruiterId (FK), title, description
├── requirements, location
├── jobType: FULL_TIME | PART_TIME | CONTRACT | INTERNSHIP | REMOTE
├── salaryMin?, salaryMax?, skills String[]
├── viewCount (default 0), isActive (default true)
└── expiresAt?, createdAt, updatedAt

Application
├── id, applicantId (FK), jobId (FK)
├── status: APPLIED | REVIEWING | INTERVIEWING | ACCEPTED | REJECTED
├── coverLetter?, createdAt, updatedAt
└── UNIQUE [applicantId, jobId]

Interview
├── id, applicationId (FK), scheduledAt
├── duration (default 60)
├── type: IN_PERSON | VIDEO | PHONE
├── status: SCHEDULED | COMPLETED | CANCELLED
├── notes?, conferenceId?
└── createdAt, updatedAt

Bookmark
├── id, applicantId (FK), jobId (FK)
├── createdAt
└── UNIQUE [applicantId, jobId]

Message
├── id, senderId?, receiverId?
├── content, isBot (default false)
└── sessionId, createdAt

Conference
├── id, roomCode (unique, 8-char), title
├── status: WAITING | ACTIVE | ENDED
└── startedAt?, endedAt?, createdAt

ConferenceParticipant
├── id, conferenceId (FK), userId (FK)
├── joinedAt?, leftAt?
└── UNIQUE [conferenceId, userId]

Payment
├── id, userId (FK), amount (500 | 5000)
├── status: PENDING | COMPLETED | FAILED | REFUNDED
├── transactionRef?, paymentMethod?, paidAt?
└── createdAt

Verification
├── id, userId (unique FK), citizenId
├── status: PENDING | VERIFIED | FAILED
└── verifiedAt?, createdAt
```

---

## 🔧 Key Technical Highlights

| Feature                  | Implementation                                                    |
| ------------------------ | ----------------------------------------------------------------- |
| **Thai ID Verification** | Mod-11 checksum algorithm (weights 13→2)                          |
| **Payment Mock**         | Card ending "0000" = fail, others = 90% success                   |
| **Bot Chat**             | Keyword matching with 8 topic handlers                            |
| **Recommendations**      | Prisma `hasSome` on skills array, scored by match count           |
| **Role Guards**          | Next.js middleware (cookie-based) + layout-level `useRequireAuth` |
| **SonarCloud Safety**    | No `any` types, no `console.log`, no hardcoded secrets            |

---

## 🐛 Issues Encountered & Fixes

### Issue 1: Prisma Schema Location

**Problem:**

```
Error: Could not find Prisma Schema that is required for this command.
Checked following paths:
  schema.prisma: file not found
  prisma\schema.prisma: file not found
```

**Root Cause:** Schema located at `src/prisma/schema.prisma` but Prisma expected `prisma/schema.prisma`

**Fix:** Added schema path to `package.json`:

```json
{
  "prisma": {
    "schema": "src/prisma/schema.prisma"
  }
}
```

---

### Issue 2: Next.js Config Format

**Problem:**

```
Error: Configuring Next.js via 'next.config.ts' is not supported.
Please replace the file with 'next.config.js' or 'next.config.mjs'.
```

**Fix:** Renamed `next.config.ts` → `next.config.mjs` and removed TypeScript syntax

---

### Issue 3: Missing .gitignore

**Problem:** `.env` files not ignored

**Fix:** Created 3 `.gitignore` files:

- Root: `node_modules/`, `.env*`, `dist/`, `.next/`
- Backend: `.env` protection
- Frontend: `.env.local` protection

---

### Issue 4: Broken Recruiter Dashboard Pages

**Problem:** Applicant Profile page showed empty professional info, and "Applications to Your Jobs" was empty or failing.

**Root Cause:** 
1. `GET /api/users/:id` didn't include `applicantProfile` table in the Prisma query.
2. Missing backend route for `GET /api/applications/applicant/:id`.

**Fix:** 
1. Updated `users.routes.ts` to include `applicantProfile` in the select block.
2. Implemented `GET /api/applications/applicant/:id` in `applications.routes.ts`.

---

### Issue 5: Interview Schedule Validation Error

**Problem:** `Expected string, received null` error when scheduling an interview without notes.

**Root Cause:** Zod schema for `CreateInterview` and `UpdateInterview` required notes to be a `string` if present, but frontend sent `null` for empty textareas.

**Fix:** Updated `interviews.routes.ts` Zod schemas to use `.nullable()` for the `notes` field.

---

### Issue 6: Build Error - Missing `phone` property in `AuthUser`

**Problem:** Frontend build failed in `ApplicantProfilePage` because `AuthUser` type was missing the `phone` property.

**Root Cause:** The `AuthUser` interface in `frontend/src/types/index.ts` didn't match the database model, and backend auth routes were not consistently returning the `phone` field.

**Fix:** 
1. Added `phone: string | null;` to `AuthUser` interface in `types/index.ts`.
2. Updated `/api/auth/register` and `/api/auth/login` in `auth.routes.ts` to include `phone` in the Prisma select block.

---

### Issue 7: Build Error - Missing profile properties in `AuthUser`

**Problem:** Frontend build failed in `ApplicantProfilePage` because `AuthUser` type was missing the `applicantProfile` property.

**Root Cause:** The `AuthUser` interface in `frontend/src/types/index.ts` was an incomplete subset of the `User` entity, and backend auth routes didn't join related profile tables.

**Fix:** 
1. Added `applicantProfile?: ApplicantProfile | null;` and `recruiterProfile?: RecruiterProfile | null;` to the `AuthUser` interface.
2. Updated `/api/auth/register` and `/api/auth/login` in `auth.routes.ts` to include `applicantProfile` and `recruiterProfile` in the Prisma select block.

---

---

## 📁 Final File Structure

```
2025-ITCS383-Chongyai/
├── .gitignore
├── README.md
├── Chongyai_D3_AILog.md          # This file
├── designs/
│   ├── Chongyai_D1_Design.md
│   └── images/
│       ├── C4_lv1.png
│       ├── C4_lv2.png
│       ├── C4_lv3.png
│       ├── class_diagram.png
│       ├── dfd_lv_0.png
│       ├── dfd_lv_1.png
│       └── use_case.drawio.png
└── implementations/
    ├── docker-compose.yml
    ├── README.md
    ├── backend/
    │   ├── .env.example
    │   ├── .gitignore
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── src/
    │       ├── index.ts
    │       ├── prisma/
    │       │   ├── schema.prisma
    │       │   └── seed.ts
    │       ├── lib/
    │       │   ├── prisma.ts
    │       │   ├── jwt.ts
    │       │   ├── password.ts
    │       │   └── response.ts
    │       ├── types/
    │       │   └── express.d.ts
    │       ├── middleware/
    │       │   ├── auth.middleware.ts
    │       │   ├── validate.middleware.ts
    │       │   └── error.middleware.ts
    │       └── routes/
    │           ├── auth.routes.ts
    │           ├── users.routes.ts
    │           ├── jobs.routes.ts
    │           ├── search.routes.ts
    │           ├── applications.routes.ts
    │           ├── interviews.routes.ts
    │           ├── bookmarks.routes.ts
    │           ├── recommendations.routes.ts
    │           ├── reports.routes.ts
    │           ├── verifications.routes.ts
    │           ├── payments.routes.ts
    │           ├── chat.routes.ts
    │           └── conference.routes.ts
    └── frontend/
        ├── .env.local.example
        ├── .gitignore
        ├── package.json
        ├── tsconfig.json
        ├── tailwind.config.ts
        ├── postcss.config.js
        ├── next.config.mjs
        └── src/
            ├── middleware.ts
            ├── app/
            │   ├── layout.tsx
            │   ├── page.tsx
            │   ├── globals.css
            │   ├── not-found.tsx
            │   ├── error.tsx
            │   ├── auth/
            │   │   ├── login/page.tsx
            │   │   └── register/page.tsx
            │   └── dashboard/
            │       ├── chat/
            │       ├── conference/[roomCode]/
            │       ├── applicant/
            │       ├── recruiter/
            │       └── admin/
            ├── components/
            │   ├── ui/
            │   ├── layout/
            │   ├── jobs/
            │   ├── applications/
            │   ├── chat/
            │   ├── conference/
            │   └── dashboard/
            ├── context/
            │   └── AuthContext.tsx
            ├── hooks/
            ├── lib/
            └── types/
```

**Total:** 100+ files created across full stack

---

## 🚀 How to Run

### 1. Start Database

```bash
cd implementations
docker-compose up -d
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run db:migrate
npm run db:seed
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

### 4. Access Application

- URL: http://localhost:3000
- Backend API: http://localhost:4000

### Demo Credentials

| Role      | Email                | Password      |
| --------- | -------------------- | ------------- |
| Applicant | applicant1@email.com | Applicant@123 |
| Recruiter | recruiter1@email.com | Recruiter@123 |
| Admin     | admin@chongyai.com   | Admin@123     |

---

## ✅ Verification Checklist

- [x] Landing page with orange/yellow hero
- [x] JWT auth with 3 role types
- [x] Applicant: search jobs, apply, bookmarks, interviews
- [x] Recruiter: post jobs, manage applicants, schedule interviews
- [x] Admin: reports dashboard with charts
- [x] Thai ID verification (Mod-11)
- [x] Payment mock (500 THB / 5,000 THB)
- [x] Chat bot + human support hours
- [x] Conference room simulation
- [x] SonarCloud ready (0 Blocker, 0 High issues)

---

## 📝 Notes

- Original D1 design mentioned Golang, but D2 requirement specified Express.js TypeScript
- All code follows clean coding practices
- No `any` types used
- All secrets from environment variables
- Modular architecture for v1.0 release

---

**AI Assistant:** Claude (Anthropic) / opencode / Antigravity
