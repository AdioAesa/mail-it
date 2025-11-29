import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { clerkMiddleware } from '@clerk/express';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { authenticateUser } from './middleware/auth.js';
import logger from './utils/logger.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy (required for Clerk when behind a reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API
}));

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
// Note: Webhook routes need raw body, so they handle parsing themselves
app.use((req, res, next) => {
  if (req.originalUrl.includes('/webhooks/stripe')) {
    next();
  } else {
    express.json({ limit: '10mb' })(req, res, next);
  }
});

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Clerk authentication middleware (skip for public API routes)
app.use((req, res, next) => {
  // Skip Clerk for public routes
  const publicPaths = ['/api/mailer/nearby', '/api/health', '/api/templates', '/api/webhooks'];
  const isPublic = publicPaths.some(path => req.path.startsWith(path));

  if (isPublic) {
    return next();
  }

  // Apply Clerk middleware for protected routes
  try {
    clerkMiddleware()(req, res, next);
  } catch (error) {
    // If Clerk fails (e.g., missing keys), continue without auth in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Clerk middleware error, continuing without auth:', error.message);
      next();
    } else {
      next(error);
    }
  }
});

// Custom auth middleware to sync users to our database
// Only apply to non-webhook routes
app.use((req, res, next) => {
  if (req.originalUrl.includes('/api/webhooks')) {
    next();
  } else if (req.auth?.userId) {
    authenticateUser(req, res, next);
  } else {
    next();
  }
});

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'MailIt API',
    version: '1.0.0',
    documentation: '/api/health'
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`MailIt API server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Promise Rejection:', error);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

export default app;
