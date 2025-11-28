/**
 * Stripe Webhook Handlers
 * Process Stripe events for payments and Connect accounts
 */

const Stripe = require('stripe');
const config = require('../config');
const constants = require('../config/constants');

let stripe;

/**
 * Initialize Stripe client
 */
function initializeStripe() {
  if (!stripe && !config.mockMode) {
    stripe = new Stripe(config.stripe.secretKey, {
      apiVersion: config.stripe.apiVersion
    });
  }
  return stripe;
}

/**
 * Verify webhook signature
 * @param {string|Buffer} payload - Raw request body
 * @param {string} signature - Stripe signature header
 * @returns {Object} Verified event object
 */
function verifyWebhookSignature(payload, signature) {
  console.log('Verifying webhook signature...');

  if (config.mockMode) {
    return JSON.parse(payload);
  }

  initializeStripe();

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      config.stripe.webhookSecret
    );

    console.log(`Webhook verified: ${event.type}`);
    return event;
  } catch (error) {
    console.error('Webhook signature verification failed:', error.message);
    throw new Error(`Webhook signature verification failed: ${error.message}`);
  }
}

/**
 * Handle payment intent succeeded event
 * @param {Object} event - Stripe event object
 * @returns {Promise<Object>} Processing result
 */
async function handlePaymentSucceeded(event) {
  const paymentIntent = event.data.object;
  const orderId = paymentIntent.metadata.orderId;

  console.log(`Payment succeeded for order ${orderId}: ${paymentIntent.id}`);

  return {
    type: 'payment.succeeded',
    orderId,
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    customerEmail: paymentIntent.receipt_email,
    metadata: paymentIntent.metadata,
    timestamp: new Date(event.created * 1000)
  };
}

/**
 * Handle payment intent failed event
 * @param {Object} event - Stripe event object
 * @returns {Promise<Object>} Processing result
 */
async function handlePaymentFailed(event) {
  const paymentIntent = event.data.object;
  const orderId = paymentIntent.metadata.orderId;
  const error = paymentIntent.last_payment_error;

  console.error(`Payment failed for order ${orderId}: ${error?.message || 'Unknown error'}`);

  return {
    type: 'payment.failed',
    orderId,
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    error: {
      code: error?.code,
      message: error?.message,
      declineCode: error?.decline_code,
      type: error?.type
    },
    timestamp: new Date(event.created * 1000)
  };
}

/**
 * Handle account updated event (Connect onboarding)
 * @param {Object} event - Stripe event object
 * @returns {Promise<Object>} Processing result
 */
async function handleAccountUpdated(event) {
  const account = event.data.object;

  console.log(`Connect account updated: ${account.id}`);

  return {
    type: 'account.updated',
    accountId: account.id,
    email: account.email,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
    isComplete: account.charges_enabled && account.payouts_enabled,
    requirements: {
      currentlyDue: account.requirements?.currently_due || [],
      errors: account.requirements?.errors || [],
      eventuallyDue: account.requirements?.eventually_due || [],
      pendingVerification: account.requirements?.pending_verification || []
    },
    timestamp: new Date(event.created * 1000)
  };
}

/**
 * Handle transfer created event
 * @param {Object} event - Stripe event object
 * @returns {Promise<Object>} Processing result
 */
async function handleTransferCreated(event) {
  const transfer = event.data.object;
  const orderId = transfer.metadata.orderId;

  console.log(`Transfer created for order ${orderId}: ${transfer.id}`);

  return {
    type: 'transfer.created',
    transferId: transfer.id,
    orderId,
    amount: transfer.amount,
    currency: transfer.currency,
    destination: transfer.destination,
    metadata: transfer.metadata,
    timestamp: new Date(event.created * 1000)
  };
}

/**
 * Handle transfer failed event
 * @param {Object} event - Stripe event object
 * @returns {Promise<Object>} Processing result
 */
async function handleTransferFailed(event) {
  const transfer = event.data.object;
  const orderId = transfer.metadata.orderId;

  console.error(`Transfer failed for order ${orderId}: ${transfer.id}`);

  return {
    type: 'transfer.failed',
    transferId: transfer.id,
    orderId,
    amount: transfer.amount,
    destination: transfer.destination,
    failureMessage: transfer.failure_message,
    failureCode: transfer.failure_code,
    timestamp: new Date(event.created * 1000)
  };
}

/**
 * Handle charge refunded event
 * @param {Object} event - Stripe event object
 * @returns {Promise<Object>} Processing result
 */
async function handleChargeRefunded(event) {
  const charge = event.data.object;

  console.log(`Charge refunded: ${charge.id}`);

  return {
    type: 'charge.refunded',
    chargeId: charge.id,
    paymentIntentId: charge.payment_intent,
    amount: charge.amount_refunded,
    currency: charge.currency,
    refunds: charge.refunds.data.map(refund => ({
      id: refund.id,
      amount: refund.amount,
      reason: refund.reason,
      status: refund.status
    })),
    timestamp: new Date(event.created * 1000)
  };
}

/**
 * Main webhook event router
 * @param {Object} event - Verified Stripe event
 * @returns {Promise<Object>} Processing result
 */
async function handleWebhookEvent(event) {
  console.log(`Processing webhook event: ${event.type}`);

  try {
    switch (event.type) {
      case constants.WEBHOOK_EVENTS.PAYMENT_SUCCEEDED:
      case 'payment_intent.succeeded':
        return await handlePaymentSucceeded(event);

      case constants.WEBHOOK_EVENTS.PAYMENT_FAILED:
      case 'payment_intent.payment_failed':
        return await handlePaymentFailed(event);

      case constants.WEBHOOK_EVENTS.ACCOUNT_UPDATED:
      case 'account.updated':
        return await handleAccountUpdated(event);

      case constants.WEBHOOK_EVENTS.TRANSFER_CREATED:
      case 'transfer.created':
        return await handleTransferCreated(event);

      case constants.WEBHOOK_EVENTS.TRANSFER_FAILED:
      case 'transfer.failed':
        return await handleTransferFailed(event);

      case 'charge.refunded':
        return await handleChargeRefunded(event);

      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
        return {
          type: 'unhandled',
          eventType: event.type,
          timestamp: new Date(event.created * 1000)
        };
    }
  } catch (error) {
    console.error(`Error processing webhook event ${event.type}:`, error.message);
    throw error;
  }
}

/**
 * Get webhook endpoint configuration
 * @returns {Object} Webhook configuration
 */
function getWebhookConfig() {
  return {
    enabledEvents: [
      'payment_intent.succeeded',
      'payment_intent.payment_failed',
      'account.updated',
      'transfer.created',
      'transfer.failed',
      'charge.refunded'
    ],
    url: process.env.WEBHOOK_URL || 'https://api.mailit.app/webhooks/stripe'
  };
}

module.exports = {
  verifyWebhookSignature,
  handlePaymentSucceeded,
  handlePaymentFailed,
  handleAccountUpdated,
  handleTransferCreated,
  handleTransferFailed,
  handleChargeRefunded,
  handleWebhookEvent,
  getWebhookConfig
};
