import express from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireMailer } from '../middleware/auth.js';
import { validateMailerRegistration, validateJobStatusUpdate } from '../middleware/validate.js';
import { geocodeAddress } from '../services/geocoding.js';
import { createConnectAccount, createAccountLink, isAccountOnboarded, createTransfer } from '../services/stripe.js';
import { getAvailableJobs, getActiveJobs, assignMailerToJob, getMailerEarnings } from '../services/matching.js';
import logger from '../utils/logger.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/mailer/register
 * Register as a mailer
 */
router.post('/register', validateMailerRegistration, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { address, city, state, zipCode, radiusMiles = 5 } = req.body;

  // Check if user is already registered as mailer
  const existing = await prisma.mailerProfile.findUnique({
    where: { userId }
  });

  if (existing) {
    return res.status(400).json({
      success: false,
      error: 'Already registered',
      message: 'You are already registered as a mailer'
    });
  }

  // Geocode the address
  const coords = await geocodeAddress(address, city, state, zipCode);

  // Create Stripe Connect account
  const stripeAccount = await createConnectAccount(req.user.email, {
    url: `https://mailit.com/mailer/${userId}`
  });

  // Create mailer profile
  const mailerProfile = await prisma.mailerProfile.create({
    data: {
      userId,
      address,
      city,
      state,
      zipCode,
      latitude: coords.latitude,
      longitude: coords.longitude,
      radiusMiles: parseInt(radiusMiles),
      stripeAccountId: stripeAccount.id,
      stripeOnboarded: false,
      isActive: false // Inactive until Stripe onboarding complete
    },
    include: {
      user: true
    }
  });

  // Create account link for onboarding
  const accountLink = await createAccountLink(
    stripeAccount.id,
    `${process.env.FRONTEND_URL}/mailer/onboarding/success`,
    `${process.env.FRONTEND_URL}/mailer/onboarding/refresh`
  );

  logger.info(`Mailer profile created for user ${userId}`);

  res.status(201).json({
    success: true,
    mailerProfile: {
      id: mailerProfile.id,
      address: mailerProfile.address,
      city: mailerProfile.city,
      state: mailerProfile.state,
      zipCode: mailerProfile.zipCode,
      radiusMiles: mailerProfile.radiusMiles,
      isActive: mailerProfile.isActive,
      stripeOnboarded: mailerProfile.stripeOnboarded
    },
    onboardingUrl: accountLink
  });
}));

/**
 * GET /api/mailer/profile
 * Get mailer profile
 */
router.get('/profile', requireMailer, asyncHandler(async (req, res) => {
  const mailerProfile = req.user.mailerProfile;

  // Check if Stripe account is fully onboarded
  if (mailerProfile.stripeAccountId && !mailerProfile.stripeOnboarded) {
    const isOnboarded = await isAccountOnboarded(mailerProfile.stripeAccountId);

    if (isOnboarded) {
      await prisma.mailerProfile.update({
        where: { id: mailerProfile.id },
        data: {
          stripeOnboarded: true,
          isActive: true
        }
      });

      mailerProfile.stripeOnboarded = true;
      mailerProfile.isActive = true;
    }
  }

  res.json({
    success: true,
    mailerProfile: {
      id: mailerProfile.id,
      address: mailerProfile.address,
      city: mailerProfile.city,
      state: mailerProfile.state,
      zipCode: mailerProfile.zipCode,
      radiusMiles: mailerProfile.radiusMiles,
      isActive: mailerProfile.isActive,
      stripeOnboarded: mailerProfile.stripeOnboarded,
      totalDeliveries: mailerProfile.totalDeliveries,
      rating: mailerProfile.rating
    }
  });
}));

/**
 * PUT /api/mailer/profile
 * Update mailer profile
 */
router.put('/profile', requireMailer, asyncHandler(async (req, res) => {
  const mailerId = req.user.mailerProfile.id;
  const { address, city, state, zipCode, radiusMiles, isActive } = req.body;

  const updateData = {};

  // If address changed, re-geocode
  if (address || city || state || zipCode) {
    const currentProfile = req.user.mailerProfile;

    const newAddress = address || currentProfile.address;
    const newCity = city || currentProfile.city;
    const newState = state || currentProfile.state;
    const newZipCode = zipCode || currentProfile.zipCode;

    const coords = await geocodeAddress(newAddress, newCity, newState, newZipCode);

    updateData.address = newAddress;
    updateData.city = newCity;
    updateData.state = newState;
    updateData.zipCode = newZipCode;
    updateData.latitude = coords.latitude;
    updateData.longitude = coords.longitude;
  }

  if (radiusMiles !== undefined) {
    if (radiusMiles < 1 || radiusMiles > 50) {
      return res.status(400).json({
        success: false,
        error: 'Invalid radius',
        message: 'Radius must be between 1 and 50 miles'
      });
    }
    updateData.radiusMiles = parseInt(radiusMiles);
  }

  if (isActive !== undefined) {
    updateData.isActive = Boolean(isActive);
  }

  const updatedProfile = await prisma.mailerProfile.update({
    where: { id: mailerId },
    data: updateData
  });

  logger.info(`Mailer profile updated: ${mailerId}`);

  res.json({
    success: true,
    mailerProfile: {
      id: updatedProfile.id,
      address: updatedProfile.address,
      city: updatedProfile.city,
      state: updatedProfile.state,
      zipCode: updatedProfile.zipCode,
      radiusMiles: updatedProfile.radiusMiles,
      isActive: updatedProfile.isActive
    }
  });
}));

/**
 * GET /api/mailer/jobs
 * Get available jobs in mailer's radius
 */
router.get('/jobs', requireMailer, asyncHandler(async (req, res) => {
  const mailerProfile = req.user.mailerProfile;

  if (!mailerProfile.stripeOnboarded) {
    return res.status(403).json({
      success: false,
      error: 'Onboarding incomplete',
      message: 'Complete Stripe onboarding to view available jobs'
    });
  }

  const jobs = await getAvailableJobs(
    mailerProfile.latitude,
    mailerProfile.longitude,
    mailerProfile.radiusMiles
  );

  res.json({
    success: true,
    jobs
  });
}));

/**
 * GET /api/mailer/jobs/active
 * Get mailer's active jobs
 */
router.get('/jobs/active', requireMailer, asyncHandler(async (req, res) => {
  const mailerId = req.user.mailerProfile.id;

  const jobs = await getActiveJobs(mailerId);

  res.json({
    success: true,
    jobs
  });
}));

/**
 * POST /api/mailer/jobs/:id/accept
 * Accept a job
 */
router.post('/jobs/:id/accept', requireMailer, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const mailerId = req.user.mailerProfile.id;

  const order = await assignMailerToJob(id, mailerId);

  logger.info(`Job ${order.orderNumber} accepted by mailer ${mailerId}`);

  res.json({
    success: true,
    message: 'Job accepted successfully',
    job: {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      cardType: order.cardType,
      recipientName: order.recipientName,
      deliveryAddress: order.deliveryAddress,
      deliveryCity: order.deliveryCity,
      deliveryState: order.deliveryState,
      deliveryZip: order.deliveryZip,
      payout: order.mailerPayout,
      assignedAt: order.assignedAt
    }
  });
}));

/**
 * PUT /api/mailer/jobs/:id/status
 * Update job status (printing, in_transit)
 */
router.put('/jobs/:id/status', requireMailer, validateJobStatusUpdate, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const mailerId = req.user.mailerProfile.id;

  // Verify job belongs to this mailer
  const order = await prisma.order.findFirst({
    where: {
      id,
      mailerId
    }
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Job not found'
    });
  }

  const updateData = { status };

  if (status === 'PRINTING') {
    updateData.printedAt = new Date();
  } else if (status === 'IN_TRANSIT') {
    updateData.inTransitAt = new Date();
  }

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: updateData
  });

  logger.info(`Job ${order.orderNumber} status updated to ${status}`);

  res.json({
    success: true,
    message: 'Job status updated',
    job: {
      id: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      status: updatedOrder.status,
      printedAt: updatedOrder.printedAt,
      inTransitAt: updatedOrder.inTransitAt
    }
  });
}));

/**
 * POST /api/mailer/jobs/:id/complete
 * Mark job as delivered with proof
 */
router.post('/jobs/:id/complete', requireMailer, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { deliveryProofUrl } = req.body;
  const mailerId = req.user.mailerProfile.id;

  if (!deliveryProofUrl) {
    return res.status(400).json({
      success: false,
      error: 'Delivery proof required',
      message: 'Please upload a photo of the delivered card'
    });
  }

  // Verify job belongs to this mailer
  const order = await prisma.order.findFirst({
    where: {
      id,
      mailerId
    },
    include: {
      mailer: true
    }
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Job not found'
    });
  }

  if (order.status === 'DELIVERED') {
    return res.status(400).json({
      success: false,
      error: 'Job already completed'
    });
  }

  // Update order to delivered
  const updatedOrder = await prisma.order.update({
    where: { id },
    data: {
      status: 'DELIVERED',
      deliveredAt: new Date(),
      deliveryProofUrl
    }
  });

  // Update mailer stats
  await prisma.mailerProfile.update({
    where: { id: mailerId },
    data: {
      totalDeliveries: {
        increment: 1
      }
    }
  });

  // Transfer payout to mailer's Stripe account
  try {
    await createTransfer(
      order.mailerPayout,
      order.mailer.stripeAccountId,
      order.id
    );
    logger.info(`Payout of $${order.mailerPayout} transferred to mailer ${mailerId}`);
  } catch (error) {
    logger.error(`Failed to transfer payout for order ${order.orderNumber}:`, error);
    // Continue - can retry transfer later
  }

  logger.info(`Job ${order.orderNumber} completed by mailer ${mailerId}`);

  res.json({
    success: true,
    message: 'Job completed successfully',
    job: {
      id: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      status: updatedOrder.status,
      deliveredAt: updatedOrder.deliveredAt,
      payout: updatedOrder.mailerPayout
    }
  });
}));

/**
 * GET /api/mailer/earnings
 * Get earnings summary
 */
router.get('/earnings', requireMailer, asyncHandler(async (req, res) => {
  const mailerId = req.user.mailerProfile.id;

  const earnings = await getMailerEarnings(mailerId);

  res.json({
    success: true,
    earnings
  });
}));

export default router;
