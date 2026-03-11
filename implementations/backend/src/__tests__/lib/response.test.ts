import { Response } from 'express';
import { successResponse, errorResponse, paginatedResponse } from '../../lib/response';

function makeMockRes(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('successResponse', () => {
  it('should respond with status 200 and success: true by default', () => {
    const res = makeMockRes();
    successResponse(res, { id: 1 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { id: 1 } });
  });

  it('should respect a custom status code', () => {
    const res = makeMockRes();
    successResponse(res, {}, 201);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('should handle null data', () => {
    const res = makeMockRes();
    successResponse(res, null);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: null });
  });
});

describe('errorResponse', () => {
  it('should respond with status 400 and success: false by default', () => {
    const res = makeMockRes();
    errorResponse(res, 'Something went wrong');
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Something went wrong' });
  });

  it('should use a custom status code', () => {
    const res = makeMockRes();
    errorResponse(res, 'Unauthorized', 401);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Unauthorized' });
  });

  it('should use 404 status code when provided', () => {
    const res = makeMockRes();
    errorResponse(res, 'Not found', 404);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe('paginatedResponse', () => {
  it('should include pagination metadata in the response', () => {
    const res = makeMockRes();
    paginatedResponse(res, [1, 2, 3], 30, 2, 10);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [1, 2, 3],
      pagination: { total: 30, page: 2, limit: 10, totalPages: 3 },
    });
  });

  it('should calculate totalPages correctly for non-round division', () => {
    const res = makeMockRes();
    paginatedResponse(res, [], 25, 1, 10);
    const call = (res.json as jest.Mock).mock.calls[0][0];
    expect(call.pagination.totalPages).toBe(3);
  });

  it('should return totalPages 0 when total is 0', () => {
    const res = makeMockRes();
    paginatedResponse(res, [], 0, 1, 10);
    const call = (res.json as jest.Mock).mock.calls[0][0];
    expect(call.pagination.totalPages).toBe(0);
  });
});
