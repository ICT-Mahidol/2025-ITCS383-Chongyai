import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { authenticateToken, requireRole, optionalAuth } from '../../middleware/auth.middleware';
import * as jwtLib from '../../lib/jwt';

jest.mock('../../lib/jwt');

const mockVerifyToken = jwtLib.verifyToken as jest.MockedFunction<typeof jwtLib.verifyToken>;

function makeMockReq(authHeader?: string): Request {
  return { headers: authHeader ? { authorization: authHeader } : {} } as unknown as Request;
}

function makeMockRes(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const mockNext = jest.fn() as NextFunction;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('authenticateToken', () => {
  it('should call next and attach user when token is valid', () => {
    const req = makeMockReq('Bearer valid.token.here');
    const res = makeMockRes();
    mockVerifyToken.mockReturnValue({ id: 'u1', email: 'a@b.com', role: Role.APPLICANT });

    authenticateToken(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect((req as any).user).toEqual({ id: 'u1', email: 'a@b.com', role: Role.APPLICANT });
  });

  it('should return 401 when Authorization header is missing', () => {
    const req = makeMockReq();
    const res = makeMockRes();

    authenticateToken(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when Authorization header has no Bearer prefix', () => {
    const req = makeMockReq('Token abc123');
    const res = makeMockRes();

    authenticateToken(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 when token verification fails', () => {
    const req = makeMockReq('Bearer bad.token');
    const res = makeMockRes();
    mockVerifyToken.mockImplementation(() => {
      throw new Error('jwt expired');
    });

    authenticateToken(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });
});

describe('requireRole', () => {
  it('should call next when user has an allowed role', () => {
    const req = { user: { id: 'u1', email: 'a@b.com', role: Role.RECRUITER } } as unknown as Request;
    const res = makeMockRes();
    const middleware = requireRole(Role.RECRUITER);

    middleware(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('should call next when user matches one of multiple allowed roles', () => {
    const req = { user: { id: 'u1', email: 'a@b.com', role: Role.ADMIN } } as unknown as Request;
    const res = makeMockRes();
    const middleware = requireRole(Role.RECRUITER, Role.ADMIN);

    middleware(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('should return 401 when req.user is not set', () => {
    const req = {} as Request;
    const res = makeMockRes();
    const middleware = requireRole(Role.RECRUITER);

    middleware(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 403 when user role is not in the allowed list', () => {
    const req = { user: { id: 'u1', email: 'a@b.com', role: Role.APPLICANT } } as unknown as Request;
    const res = makeMockRes();
    const middleware = requireRole(Role.RECRUITER);

    middleware(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(mockNext).not.toHaveBeenCalled();
  });
});

describe('optionalAuth', () => {
  it('should attach user and call next when a valid token is provided', () => {
    const req = makeMockReq('Bearer valid.token');
    const res = makeMockRes();
    mockVerifyToken.mockReturnValue({ id: 'u1', email: 'a@b.com', role: Role.APPLICANT });

    optionalAuth(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect((req as any).user).toEqual({ id: 'u1', email: 'a@b.com', role: Role.APPLICANT });
  });

  it('should call next without attaching user when no token provided', () => {
    const req = makeMockReq();
    const res = makeMockRes();

    optionalAuth(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect((req as any).user).toBeUndefined();
  });

  it('should call next without user when token is invalid', () => {
    const req = makeMockReq('Bearer invalid.token');
    const res = makeMockRes();
    mockVerifyToken.mockImplementation(() => {
      throw new Error('bad token');
    });

    optionalAuth(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect((req as any).user).toBeUndefined();
  });
});
