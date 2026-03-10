import { Response } from 'express';

export function successResponse<T>(
  res: Response,
  data: T,
  statusCode = 200,
): Response {
  return res.status(statusCode).json({ success: true, data });
}

export function errorResponse(
  res: Response,
  message: string,
  statusCode = 400,
): Response {
  return res.status(statusCode).json({ success: false, error: message });
}

export function paginatedResponse<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
): Response {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}
