# 2025-ITCS383-Chongyai

**Job Center Management System** — Group: Chongyai
Course: ITCS383 | Deliverable: D2

---

## Project Overview

A full-stack job center platform connecting applicants with recruiters, featuring:

- **Role-Based Access**: Applicant, Recruiter, and Admin roles
- **Job Management**: Post, search, and apply for jobs with smart recommendations
- **Application Workflow**: Applied → Reviewing → Interviewing → Accepted/Rejected
- **Identity Verification**: Mock MOI API for Thai Citizen ID (13-digit checksum)
- **Payment Processing**: Mock Banking API (500 THB for Applicants, 5,000 THB for Recruiters)
- **Support Chat**: Automated chatbot with business-hours indicator (Mon–Fri 9:00–17:00 Bangkok)
- **Video Interviews**: Internal conference room simulation

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | Next.js 14 (App Router, TypeScript, Tailwind CSS) |
| Backend   | Express.js (TypeScript)                 |
| Database  | PostgreSQL 15 via Prisma ORM            |
| Auth      | JWT (jsonwebtoken + bcryptjs)           |
| Validation| Zod                                     |

---

## Requirements

- **Node.js** 18+ and **npm** 9+
- **PostgreSQL** 15 (or use the included Docker Compose)
- **Docker** (optional, for database only)

---

## Setup

### 1. Start the Database

Using Docker (recommended):

```bash
cd implementations
docker-compose up -d
```

Or configure an existing PostgreSQL instance and update `DATABASE_URL` accordingly.

### 2. Backend Setup

```bash
cd implementations/backend

# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# (Optional) Seed sample data
npm run db:seed
```

### 3. Frontend Setup

```bash
cd implementations/frontend

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local
# Edit .env.local if the backend runs on a different port
```

---

## Build

### Backend

```bash
cd implementations/backend
npm run build
```

### Frontend

```bash
cd implementations/frontend
npm run build
```

---

## Run

### Development Mode

**Backend** (in one terminal):

```bash
cd implementations/backend
npm run dev
# Runs on http://localhost:4000
```

**Frontend** (in another terminal):

```bash
cd implementations/frontend
npm run dev
# Runs on http://localhost:3000
```

### Production Mode

```bash
# Backend
cd implementations/backend && npm run build && npm start

# Frontend
cd implementations/frontend && npm run build && npm start
```

---

## Example Usage

1. Open **http://localhost:3000** in your browser
2. The landing page showcases job listings and platform features

### Demo Accounts (after seeding)

| Role      | Email                        | Password       |
|-----------|------------------------------|----------------|
| Admin     | admin@chongyai.com           | Admin@123      |
| Recruiter | recruiter1@techcorp.com      | Recruiter@123  |
| Applicant | applicant1@email.com         | Applicant@123  |

### User Flows

**As an Applicant:**
1. Register → Pay 500 THB (test card: any card NOT ending in 0000)
2. Verify Thai Citizen ID (use a valid 13-digit ID with correct checksum)
3. Browse jobs, bookmark favourites, apply with cover letter
4. Track application status in the Applications dashboard

**As a Recruiter:**
1. Register → Pay 5,000 THB
2. Post job listings with required skills, salary range, and type
3. Review incoming applications, change statuses, schedule interviews

**As an Admin:**
1. Login and access the Admin Dashboard
2. View system-wide reports, user management, and payment records

---

## API Endpoints

Base URL: `http://localhost:4000/api`

| Module        | Base Path             | Description                        |
|---------------|-----------------------|------------------------------------|
| Auth          | `/auth`               | Register, login, token management  |
| Users         | `/users`              | Profile CRUD                       |
| Jobs          | `/jobs`               | Job CRUD + view tracking           |
| Search        | `/search`             | Filter jobs by type, location, salary |
| Applications  | `/applications`       | Apply, track, update status        |
| Interviews    | `/interviews`         | Schedule and manage interviews     |
| Bookmarks     | `/bookmarks`          | Save/unsave jobs                   |
| Recommendations | `/recommendations`  | Skill-based job matching           |
| Reports       | `/reports`            | Admin statistics                   |
| Verifications | `/verifications`      | Mock MOI Thai ID verification      |
| Payments      | `/payments`           | Mock banking payment processing    |
| Chat          | `/chat`               | Chatbot + support status           |
| Conference    | `/conference`         | Video interview rooms              |

---

## Project Structure

```
implementations/
├── backend/          # Express.js TypeScript API
│   └── src/
│       ├── prisma/   # Database schema and seed
│       ├── lib/      # JWT, password, response utilities
│       ├── middleware/ # Auth, validation, error handling
│       └── routes/   # 13 route modules
└── frontend/         # Next.js App Router frontend
    └── src/
        ├── app/      # Pages and layouts
        ├── components/ # UI and feature components
        ├── hooks/    # Custom React hooks
        ├── lib/      # API client, auth helpers
        └── types/    # TypeScript interfaces
```

---

## Design Documents

Architecture diagrams are in `designs/`:

- `Chongyai_D1_Design.md` — Design rationale and models
- `images/` — C4, DFD, Class, and Use Case diagrams