import { Response } from 'express';

export interface ApiResponseOptions<T> {
  statusCode?: number;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export class ApiResponse {
  static success<T>(
    res: Response,
    { statusCode = 200, message = 'Success', data, meta }: ApiResponseOptions<T>
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      meta,
      timestamp: new Date().toISOString(),
    });
  }

  static error(
    res: Response,
    {
      statusCode = 500,
      message = 'Internal Server Error',
      errors,
    }: { statusCode?: number; message?: string; errors?: unknown }
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
  }
}
