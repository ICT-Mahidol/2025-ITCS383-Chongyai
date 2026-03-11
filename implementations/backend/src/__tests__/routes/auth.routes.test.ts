import request from 'supertest';
import { Role } from '@prisma/client';
import app from '../../app';
import { prisma } from '../../lib/prisma';
import * as passwordLib from '../../lib/password';
import * as jwtLib from '../../lib/jwt';

jest.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('../../lib/password');
jest.mock('../../lib/jwt');

const mockPrismaUser = (prisma as any).user as {
  findUnique: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
};
const mockHashPassword = passwordLib.hashPassword as jest.MockedFunction<typeof passwordLib.hashPassword>;
const mockComparePassword = passwordLib.comparePassword as jest.MockedFunction<typeof passwordLib.comparePassword>;
const mockSignToken = jwtLib.signToken as jest.MockedFunction<typeof jwtLib.signToken>;
const mockVerifyToken = jwtLib.verifyToken as jest.MockedFunction<typeof jwtLib.verifyToken>;

const BASE_USER = {
  id: 'user-uuid-1',
  email: 'alice@example.com',
  role: Role.APPLICANT,
  firstName: 'Alice',
  lastName: 'Smith',
  phone: null,
  isVerified: false,
  isPaid: false,
  profileImageUrl: null,
  createdAt: new Date().toISOString(),
  applicantProfile: null,
  recruiterProfile: null,
};

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = 'test-secret';
});

// ─── POST /api/auth/register ───────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  const validBody = {
    email: 'alice@example.com',
    password: 'password123',
    role: 'APPLICANT',
    firstName: 'Alice',
    lastName: 'Smith',
  };

  it('should register a new applicant and return 201 with token', async () => {
    mockPrismaUser.findUnique.mockResolvedValue(null);
    mockHashPassword.mockResolvedValue('hashed_pw');
    mockPrismaUser.create.mockResolvedValue({ ...BASE_USER, passwordHash: 'hashed_pw' });
    mockSignToken.mockReturnValue('signed.jwt.token');

    const res = await request(app).post('/api/auth/register').send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBe('signed.jwt.token');
  });

  it('should return 409 when email is already registered', async () => {
    mockPrismaUser.findUnique.mockResolvedValue(BASE_USER);

    const res = await request(app).post('/api/auth/register').send(validBody);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should return 422 for an invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validBody, email: 'not-an-email' });

    expect(res.status).toBe(422);
  });

  it('should return 422 for a password shorter than 8 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validBody, password: 'short' });

    expect(res.status).toBe(422);
  });

  it('should return 422 when trying to register as ADMIN', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validBody, role: 'ADMIN' });

    expect(res.status).toBe(422);
  });

  it('should return 422 when required fields are missing', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'a@b.com' });

    expect(res.status).toBe(422);
  });
});

// ─── POST /api/auth/login ──────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  const validBody = { email: 'alice@example.com', password: 'password123' };
  const storedUser = { ...BASE_USER, passwordHash: 'hashed_pw' };

  it('should return 200 with token and user on valid credentials', async () => {
    mockPrismaUser.findUnique.mockResolvedValue(storedUser);
    mockComparePassword.mockResolvedValue(true);
    mockSignToken.mockReturnValue('signed.jwt.token');

    const res = await request(app).post('/api/auth/login').send(validBody);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBe('signed.jwt.token');
    expect(res.body.data.user).not.toHaveProperty('passwordHash');
  });

  it('should return 401 when user is not found', async () => {
    mockPrismaUser.findUnique.mockResolvedValue(null);

    const res = await request(app).post('/api/auth/login').send(validBody);

    expect(res.status).toBe(401);
  });

  it('should return 401 when password is incorrect', async () => {
    mockPrismaUser.findUnique.mockResolvedValue(storedUser);
    mockComparePassword.mockResolvedValue(false);

    const res = await request(app).post('/api/auth/login').send(validBody);

    expect(res.status).toBe(401);
  });

  it('should return 422 when email is missing', async () => {
    const res = await request(app).post('/api/auth/login').send({ password: 'pw' });

    expect(res.status).toBe(422);
  });
});

// ─── GET /api/auth/me ──────────────────────────────────────────────────────

describe('GET /api/auth/me', () => {
  it('should return 200 with user data for an authenticated request', async () => {
    mockVerifyToken.mockReturnValue({ id: 'user-uuid-1', email: 'alice@example.com', role: Role.APPLICANT });
    mockPrismaUser.findUnique.mockResolvedValue(BASE_USER);

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer valid.token');

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('alice@example.com');
  });

  it('should return 401 when no token is provided', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
  });

  it('should return 404 when user no longer exists', async () => {
    mockVerifyToken.mockReturnValue({ id: 'user-uuid-1', email: 'alice@example.com', role: Role.APPLICANT });
    mockPrismaUser.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer valid.token');

    expect(res.status).toBe(404);
  });
});

// ─── POST /api/auth/logout ─────────────────────────────────────────────────

describe('POST /api/auth/logout', () => {
  it('should return 200 for an authenticated request', async () => {
    mockVerifyToken.mockReturnValue({ id: 'user-uuid-1', email: 'alice@example.com', role: Role.APPLICANT });

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', 'Bearer valid.token');

    expect(res.status).toBe(200);
  });

  it('should return 401 when not authenticated', async () => {
    const res = await request(app).post('/api/auth/logout');

    expect(res.status).toBe(401);
  });
});
