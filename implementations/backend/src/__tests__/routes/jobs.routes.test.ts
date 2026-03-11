import request from 'supertest';
import { Role, JobType } from '@prisma/client';
import app from '../../app';
import { prisma } from '../../lib/prisma';
import * as jwtLib from '../../lib/jwt';

jest.mock('../../lib/prisma', () => ({
  prisma: {
    job: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('../../lib/jwt');

const mockPrismaJob = (prisma as any).job as {
  findMany: jest.Mock;
  findUnique: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  count: jest.Mock;
};
const mockPrismaTransaction = (prisma as any).$transaction as jest.Mock;
const mockVerifyToken = jwtLib.verifyToken as jest.MockedFunction<typeof jwtLib.verifyToken>;

const BASE_JOB = {
  id: 'job-uuid-1',
  title: 'Backend Developer',
  description: 'Build great APIs for our platform',
  requirements: 'Node.js, TypeScript, PostgreSQL experience required',
  location: 'Bangkok',
  jobType: JobType.FULL_TIME,
  salaryMin: 50000,
  salaryMax: 80000,
  skills: ['Node.js', 'TypeScript'],
  isActive: true,
  recruiterId: 'recruiter-uuid-1',
  viewCount: 5,
  createdAt: new Date().toISOString(),
  expiresAt: null,
  recruiter: {
    id: 'recruiter-uuid-1',
    firstName: 'Bob',
    lastName: 'Recruiter',
    recruiterProfile: { companyName: 'TechCorp' },
  },
  _count: { applications: 3 },
};

const RECRUITER_TOKEN_PAYLOAD = {
  id: 'recruiter-uuid-1',
  email: 'recruiter@example.com',
  role: Role.RECRUITER,
};

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = 'test-secret';
});

// ─── GET /api/jobs ─────────────────────────────────────────────────────────

describe('GET /api/jobs', () => {
  it('should return paginated active jobs with status 200', async () => {
    mockPrismaTransaction.mockResolvedValue([[BASE_JOB], 1]);

    const res = await request(app).get('/api/jobs');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  it('should accept page and limit query parameters', async () => {
    mockPrismaTransaction.mockResolvedValue([[], 0]);

    const res = await request(app).get('/api/jobs?page=2&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(10);
  });

  it('should cap limit to a maximum of 50', async () => {
    mockPrismaTransaction.mockResolvedValue([[], 0]);

    const res = await request(app).get('/api/jobs?limit=100');

    expect(res.status).toBe(200);
    expect(res.body.pagination.limit).toBe(50);
  });

  it('should use page 1 when an invalid page is provided', async () => {
    mockPrismaTransaction.mockResolvedValue([[], 0]);

    const res = await request(app).get('/api/jobs?page=0');

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(1);
  });
});

// ─── GET /api/jobs/:id ─────────────────────────────────────────────────────

describe('GET /api/jobs/:id', () => {
  it('should return the job and increment viewCount', async () => {
    mockPrismaJob.findUnique.mockResolvedValue(BASE_JOB);
    mockPrismaJob.update.mockResolvedValue({ ...BASE_JOB, viewCount: 6 });

    const res = await request(app).get('/api/jobs/job-uuid-1');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('job-uuid-1');
    expect(mockPrismaJob.update).toHaveBeenCalledWith({
      where: { id: 'job-uuid-1' },
      data: { viewCount: { increment: 1 } },
    });
  });

  it('should return 404 when job does not exist', async () => {
    mockPrismaJob.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/jobs/nonexistent-id');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─── POST /api/jobs ────────────────────────────────────────────────────────

describe('POST /api/jobs', () => {
  const validBody = {
    title: 'Senior Developer',
    description: 'Build scalable systems for enterprise clients worldwide',
    requirements: 'At least 5 years of software engineering experience required',
    location: 'Remote',
    jobType: 'FULL_TIME',
    skills: ['TypeScript', 'React'],
  };

  it('should create a job and return 201 for an authenticated recruiter', async () => {
    mockVerifyToken.mockReturnValue(RECRUITER_TOKEN_PAYLOAD);
    mockPrismaJob.create.mockResolvedValue({ ...BASE_JOB, ...validBody });

    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', 'Bearer recruiter.token')
      .send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 401 when not authenticated', async () => {
    const res = await request(app).post('/api/jobs').send(validBody);

    expect(res.status).toBe(401);
  });

  it('should return 403 when authenticated as APPLICANT', async () => {
    mockVerifyToken.mockReturnValue({ id: 'u1', email: 'a@b.com', role: Role.APPLICANT });

    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', 'Bearer applicant.token')
      .send(validBody);

    expect(res.status).toBe(403);
  });

  it('should return 422 for missing required fields', async () => {
    mockVerifyToken.mockReturnValue(RECRUITER_TOKEN_PAYLOAD);

    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', 'Bearer recruiter.token')
      .send({ title: 'x' });

    expect(res.status).toBe(422);
  });
});

// ─── DELETE /api/jobs/:id ──────────────────────────────────────────────────

describe('DELETE /api/jobs/:id', () => {
  it('should deactivate the job and return 200 for the owning recruiter', async () => {
    mockVerifyToken.mockReturnValue(RECRUITER_TOKEN_PAYLOAD);
    mockPrismaJob.findUnique.mockResolvedValue(BASE_JOB);
    mockPrismaJob.update.mockResolvedValue({ ...BASE_JOB, isActive: false });

    const res = await request(app)
      .delete('/api/jobs/job-uuid-1')
      .set('Authorization', 'Bearer recruiter.token');

    expect(res.status).toBe(200);
    expect(mockPrismaJob.update).toHaveBeenCalledWith({
      where: { id: 'job-uuid-1' },
      data: { isActive: false },
    });
  });

  it('should return 404 when job does not exist', async () => {
    mockVerifyToken.mockReturnValue(RECRUITER_TOKEN_PAYLOAD);
    mockPrismaJob.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .delete('/api/jobs/nonexistent')
      .set('Authorization', 'Bearer recruiter.token');

    expect(res.status).toBe(404);
  });

  it('should return 403 when a recruiter tries to delete another recruiter job', async () => {
    mockVerifyToken.mockReturnValue({ id: 'other-recruiter', email: 'x@y.com', role: Role.RECRUITER });
    mockPrismaJob.findUnique.mockResolvedValue(BASE_JOB);

    const res = await request(app)
      .delete('/api/jobs/job-uuid-1')
      .set('Authorization', 'Bearer other.token');

    expect(res.status).toBe(403);
  });

  it('should return 401 when not authenticated', async () => {
    const res = await request(app).delete('/api/jobs/job-uuid-1');

    expect(res.status).toBe(401);
  });
});
