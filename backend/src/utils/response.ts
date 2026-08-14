import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const successResponse = (
  res: Response,
  data: any = null,
  message?: string,
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    ...(message && { message }),
    data,
  });
};

export const paginatedResponse = (
  res: Response,
  data: any[],
  pagination: PaginationMeta,
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    data,
    pagination,
  });
};

export const errorResponse = (
  res: Response,
  message: string,
  statusCode = 400,
  errors: any = null
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};
