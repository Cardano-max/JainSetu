import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import panchangRoutes from './routes/panchang.routes.js';
import eventRoutes from './routes/event.routes.js';
import donationRoutes from './routes/donation.routes.js';
import businessRoutes from './routes/business.routes.js';
import matrimonyRoutes from './routes/matrimony.routes.js';
import tirthRoutes from './routes/tirth.routes.js';
import storeRoutes from './routes/store.routes.js';
import jobRoutes from './routes/job.routes.js';
import propertyRoutes from './routes/property.routes.js';
import postRoutes from './routes/post.routes.js';
import adminRoutes from './routes/admin.routes.js';
import locationRoutes from './routes/location.routes.js';

import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import logger from './utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.ADMIN_URL || '', process.env.MOBILE_APP_URL || '']
    : '*',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Static files for uploads
app.use('/uploads', express.static(process.env.UPLOAD_DIR || './uploads'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/panchang', panchangRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/matrimony', matrimonyRoutes);
app.use('/api/tirth', tirthRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/locations', locationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
