import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.js';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';

    logger.log(logLevel, `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });

  next();
};
