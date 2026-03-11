import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate.middleware';

function makeMockRes(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

const mockNext = jest.fn() as NextFunction;

const TestSchema = z.object({
  username: z.string().min(3),
  age: z.number().int().positive(),
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('validate middleware', () => {
  it('should call next with a valid request body', () => {
    const req = { body: { username: 'alice', age: 30 } } as Request;
    const res = makeMockRes();

    validate(TestSchema)(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should replace req.body with the parsed (stripped) data', () => {
    const req = { body: { username: 'alice', age: 30, extra: 'ignored' } } as Request;
    const res = makeMockRes();

    validate(TestSchema)(req, res, mockNext);

    expect(req.body).toEqual({ username: 'alice', age: 30 });
  });

  it('should return 422 when required fields are missing', () => {
    const req = { body: {} } as Request;
    const res = makeMockRes();

    validate(TestSchema)(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 422 when a field fails validation', () => {
    const req = { body: { username: 'ab', age: -1 } } as Request;
    const res = makeMockRes();

    validate(TestSchema)(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should include the field path in the error message', () => {
    const req = { body: { username: 'ab', age: 25 } } as Request;
    const res = makeMockRes();

    validate(TestSchema)(req, res, mockNext);

    const jsonArg = (res.json as jest.Mock).mock.calls[0][0];
    expect(jsonArg.error).toContain('username');
  });

  it('should return 422 when body is not an object', () => {
    const req = { body: null } as Request;
    const res = makeMockRes();

    validate(TestSchema)(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(mockNext).not.toHaveBeenCalled();
  });
});
