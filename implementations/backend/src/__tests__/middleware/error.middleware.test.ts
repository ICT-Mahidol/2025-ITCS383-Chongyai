import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { errorHandler, notFoundHandler } from '../../middleware/error.middleware';

function makeMockRes(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const mockReq = {} as Request;
const mockNext = jest.fn() as NextFunction;

afterEach(() => {
  jest.clearAllMocks();
  process.env.NODE_ENV = 'test';
});

describe('errorHandler', () => {
  it('should return 409 for Prisma P2002 (unique constraint violation)', () => {
    const err = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: '5.0.0',
    });
    const res = makeMockRes();

    errorHandler(err, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Resource already exists' });
  });

  it('should return 404 for Prisma P2025 (record not found)', () => {
    const err = new Prisma.PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: '5.0.0',
    });
    const res = makeMockRes();

    errorHandler(err, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Resource not found' });
  });

  it('should use custom statusCode from AppError', () => {
    const err = Object.assign(new Error('Bad request'), { statusCode: 400 });
    const res = makeMockRes();

    errorHandler(err, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Bad request' });
  });

  it('should default to 500 for generic errors', () => {
    const err = new Error('Unexpected failure');
    const res = makeMockRes();

    errorHandler(err, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('should hide 500 error details in production', () => {
    process.env.NODE_ENV = 'production';
    const err = new Error('Database connection string exposed');
    const res = makeMockRes();

    errorHandler(err, mockReq, res, mockNext);

    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Internal server error' });
  });

  it('should expose error message in non-production for 500 errors', () => {
    process.env.NODE_ENV = 'development';
    const err = new Error('Debug info');
    const res = makeMockRes();

    errorHandler(err, mockReq, res, mockNext);

    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Debug info' });
  });
});

describe('notFoundHandler', () => {
  it('should return 404 with a "Route not found" message', () => {
    const res = makeMockRes();

    notFoundHandler(mockReq, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Route not found' });
  });
});
