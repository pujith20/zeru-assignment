import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error('API Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: {
      message,
      code: err.code || 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      path: req.path
    }
  });
};

export const createError = (message, statusCode = 500, code) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};