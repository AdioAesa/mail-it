import express from 'express';
import ordersRoutes from './orders.js';
import mailerRoutes from './mailer.js';
import templatesRoutes from './templates.js';
import uploadRoutes from './upload.js';
import webhooksRoutes from './webhooks.js';
import { requireAuth } from '@clerk/express';

const router = express.Router();

// Public routes (no auth required)
router.use('/webhooks', webhooksRoutes);
router.use('/templates', templatesRoutes);
router.use('/mailer', mailerRoutes); // Has mixed public and protected routes

// Protected routes (auth required)
router.use('/orders', requireAuth(), ordersRoutes);
router.use('/upload', requireAuth(), uploadRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'MailIt API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
