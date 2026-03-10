# Job Center Management System - Implementation Guide

This guide provides instructions for setting up, running, testing, and deploying the Job Center Management System.

## 📋 Project Overview

A full-stack job portal with features for Applicants, Recruiters, and Admins.
- **Frontend:** Next.js 14+ (App Router)
- **Backend:** Express.js (TypeScript)
- **Database:** PostgreSQL + Prisma ORM

---

## 🛠️ Prerequisites

Ensure you have the following installed:
- **Node.js** (v18 or later)
- **npm** or **yarn**
- **Docker** and **Docker Compose**
- **PostgreSQL** (if running without Docker)

---

## 🚀 Local Development Setup

### 1. Start the Database
The easiest way to start the database is using Docker Compose:
```bash
docker-compose up -d
```
This starts a PostgreSQL instance at `localhost:5432`.

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Update .env with your DATABASE_URL and JWT_SECRET
npm run db:migrate
npm run db:seed
npm run dev
```
- **API URL:** `http://localhost:4000`

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```
- **App URL:** `http://localhost:3000`

---

## 🧪 Testing and Quality

### Linting
To check for code style issues:
```bash
# In backend or frontend directory
npm run lint
```

### Static Analysis
The project is configured for **SonarCloud** integration. You can find the configuration in `sonar-project.properties` at the root.

---

## 🚢 Deployment Guide

### Docker Deployment
To run the entire stack in production mode using Docker:
```bash
docker-compose up --build
```

### CI/CD (GitHub Actions)
The project uses GitHub Actions for continuous integration.
- **Workflow Path:** `.github/workflows/ci.yml`
- **Triggers:** Pushes and Pull Requests to the `master` branch.
- **Actions:** Runs builds and performs automated checks.

---

## 🔑 Demo Credentials

| Role      | Email                | Password      |
| --------- | -------------------- | ------------- |
| Applicant | applicant1@email.com | Applicant@123 |
| Recruiter | recruiter1@email.com | Recruiter@123 |
| Admin     | admin@chongyai.com   | Admin@123     |

---

## 📝 Maintenance Notes

- **Database Migrations:** Always run `npm run db:migrate` after changing the `schema.prisma` file.
- **Environment Variables:** Never commit `.env` or `.env.local` files to version control.
