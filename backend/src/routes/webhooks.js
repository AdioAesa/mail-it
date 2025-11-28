import express from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyWebhookSignature, retrievePaymentIntent } from '../services/stripe.js';
import logger from '../utils/logger.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhooks
 *
 * IMPORTANT: This route must use raw body, not JSON parsed body
 */
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'];

  try {
    // Verify webhook signature
    const event = verifyWebhookSignature(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    logger.info(`Stripe webhook received: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'account.updated':
        await handleAccountUpdated(event.data.object);
        break;

      case 'transfer.created':
        logger.info('Transfer created:', event.data.object.id);
        break;

      case 'transfer.failed':
        logger.error('Transfer failed:', event.data.object);
        break;

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Webhook error:', error);
    res.status(400).json({
      error: 'Webhook error',
      message: error.message
    });
  }
});

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(paymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId;

    if (!orderId) {
      logger.warn('Payment intent has no order ID in metadata');
      return;
    }

    // Update order status to PAID
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        stripePaymentId: paymentIntent.id
      }
    });

    logger.info(`Order ${order.orderNumber} marked as PAID`);
  } catch (error) {
    logger.error('Error handling payment succeeded:', error);
    throw error;
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId;

    if (!orderId) {
      logger.warn('Payment intent has no order ID in metadata');
      return;
    }

    logger.error(`Payment failed for order ${orderId}:`, paymentIntent.last_payment_error);

    // Optionally update order with payment failure info
    // For now, just log it
  } catch (error) {
    logger.error('Error handling payment failed:', error);
  }
}

/**
 * Handle Stripe Connect account updates
 */
async function handleAccountUpdated(account) {
  try {
    // Find mailer with this Stripe account
    const mailerProfile = await prisma.mailerProfile.findUnique({
      where: { stripeAccountId: account.id }
    });

    if (!mailerProfile) {
      logger.warn(`No mailer found for Stripe account ${account.id}`);
      return;
    }

    // Check if account is now fully onboarded
    const isOnboarded = account.details_submitted &&
                       account.charges_enabled &&
                       account.payouts_enabled;

    if (isOnboarded && !mailerProfile.stripeOnboarded) {
      await prisma.mailerProfile.update({
        where: { id: mailerProfile.id },
        data: {
          stripeOnboarded: true,
          isActive: true
        }
      });

      logger.info(`Mailer ${mailerProfile.id} completed Stripe onboarding`);
    }
  } catch (error) {
    logger.error('Error handling account updated:', error);
  }
}

export default router;
