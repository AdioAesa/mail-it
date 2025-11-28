/**
 * Stripe Payment Processing
 * Handles payment intents, confirmations, and refunds
 */

const Stripe = require('stripe');
const config = require('../config');

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
 * Retry helper for transient failures
 */
async function retryOperation(operation, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxAttempts || !isRetryableError(error)) {
        throw error;
      }
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      console.log(`Retry attempt ${attempt} after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Check if error is retryable
 */
function isRetryableError(error) {
  return error.type === 'StripeConnectionError' ||
         error.type === 'StripeAPIError' ||
         error.statusCode >= 500;
}

/**
 * Create a payment intent for an order
 * @param {number} amountCents - Amount in cents
 * @param {string} orderId - Order ID for idempotency and metadata
 * @param {string} customerEmail - Customer email
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} Payment intent object
 */
async function createPaymentIntent(amountCents, orderId, customerEmail, metadata = {}) {
  console.log(`Creating payment intent for order ${orderId}: $${amountCents / 100}`);

  if (config.mockMode) {
    return {
      id: `pi_mock_${Date.now()}`,
      amount: amountCents,
      currency: 'usd',
      status: 'requires_payment_method',
      client_secret: `pi_mock_secret_${Date.now()}`,
      metadata: { orderId, ...metadata }
    };
  }

  initializeStripe();

  try {
    const paymentIntent = await retryOperation(() =>
      stripe.paymentIntents.create({
        amount: amountCents,
        currency: config.stripe.currency,
        receipt_email: customerEmail,
        metadata: {
          orderId,
          ...metadata
        },
        automatic_payment_methods: {
          enabled: true,
        },
      }, {
        idempotencyKey: `order_${orderId}_payment`
      })
    );

    console.log(`Payment intent created: ${paymentIntent.id}`);
    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error.message);
    throw new Error(`Failed to create payment intent: ${error.message}`);
  }
}

/**
 * Confirm a payment was successful
 * @param {string} paymentIntentId - Payment intent ID
 * @returns {Promise<Object>} Payment intent object
 */
async function confirmPayment(paymentIntentId) {
  console.log(`Confirming payment: ${paymentIntentId}`);

  if (config.mockMode) {
    return {
      id: paymentIntentId,
      status: 'succeeded',
      amount: 1000,
      currency: 'usd'
    };
  }

  initializeStripe();

  try {
    const paymentIntent = await retryOperation(() =>
      stripe.paymentIntents.retrieve(paymentIntentId)
    );

    if (paymentIntent.status !== 'succeeded') {
      throw new Error(`Payment not successful. Status: ${paymentIntent.status}`);
    }

    console.log(`Payment confirmed: ${paymentIntentId}`);
    return paymentIntent;
  } catch (error) {
    console.error('Error confirming payment:', error.message);
    throw new Error(`Failed to confirm payment: ${error.message}`);
  }
}

/**
 * Get payment intent details
 * @param {string} paymentIntentId - Payment intent ID
 * @returns {Promise<Object>} Payment intent object
 */
async function getPaymentIntent(paymentIntentId) {
  console.log(`Retrieving payment intent: ${paymentIntentId}`);

  if (config.mockMode) {
    return {
      id: paymentIntentId,
      status: 'succeeded',
      amount: 1000,
      currency: 'usd',
      metadata: {}
    };
  }

  initializeStripe();

  try {
    const paymentIntent = await retryOperation(() =>
      stripe.paymentIntents.retrieve(paymentIntentId)
    );

    return paymentIntent;
  } catch (error) {
    console.error('Error retrieving payment intent:', error.message);
    throw new Error(`Failed to retrieve payment intent: ${error.message}`);
  }
}

/**
 * Process a refund for a payment
 * @param {string} paymentIntentId - Payment intent ID to refund
 * @param {number} amountCents - Amount to refund (optional, full refund if not specified)
 * @param {string} reason - Reason for refund
 * @returns {Promise<Object>} Refund object
 */
async function refundPayment(paymentIntentId, amountCents = null, reason = 'requested_by_customer') {
  console.log(`Processing refund for payment: ${paymentIntentId}${amountCents ? ` (${amountCents} cents)` : ' (full)'}`);

  if (config.mockMode) {
    return {
      id: `re_mock_${Date.now()}`,
      payment_intent: paymentIntentId,
      amount: amountCents || 1000,
      status: 'succeeded',
      reason
    };
  }

  initializeStripe();

  try {
    const refundData = {
      payment_intent: paymentIntentId,
      reason
    };

    if (amountCents) {
      refundData.amount = amountCents;
    }

    const refund = await retryOperation(() =>
      stripe.refunds.create(refundData, {
        idempotencyKey: `refund_${paymentIntentId}_${Date.now()}`
      })
    );

    console.log(`Refund processed: ${refund.id}`);
    return refund;
  } catch (error) {
    console.error('Error processing refund:', error.message);
    throw new Error(`Failed to process refund: ${error.message}`);
  }
}

/**
 * Calculate platform fee for an order
 * @param {number} totalAmountCents - Total order amount
 * @returns {number} Platform fee in cents
 */
function calculatePlatformFee(totalAmountCents) {
  return Math.round(totalAmountCents * (config.stripe.platformFeePercent / 100));
}

/**
 * Calculate mailer payout amount
 * @param {number} totalAmountCents - Total order amount
 * @returns {number} Mailer payout in cents
 */
function calculateMailerPayout(totalAmountCents) {
  return Math.round(totalAmountCents * (config.pricing.mailerPayoutPercent / 100));
}

module.exports = {
  initializeStripe,
  createPaymentIntent,
  confirmPayment,
  getPaymentIntent,
  refundPayment,
  calculatePlatformFee,
  calculateMailerPayout
};
