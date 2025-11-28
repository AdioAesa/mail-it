import Stripe from 'stripe';
import logger from '../utils/logger.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create a payment intent for an order
 * @param {number} amount - Amount in dollars
 * @param {string} orderId - Order ID for metadata
 * @param {string} customerEmail - Customer email
 * @returns {Promise<Object>} Payment intent object
 */
export async function createPaymentIntent(amount, orderId, customerEmail) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        orderId,
      },
      receipt_email: customerEmail,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    logger.info(`Payment intent created: ${paymentIntent.id} for order ${orderId}`);

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    };
  } catch (error) {
    logger.error('Error creating payment intent:', error);
    throw new Error(`Failed to create payment intent: ${error.message}`);
  }
}

/**
 * Create a Stripe Connect account for a mailer
 * @param {string} email - Mailer's email
 * @param {Object} businessProfile - Business profile data
 * @returns {Promise<Object>} Connect account object
 */
export async function createConnectAccount(email, businessProfile = {}) {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      business_profile: {
        product_description: 'Hand-delivered cards and letters',
        ...businessProfile
      }
    });

    logger.info(`Stripe Connect account created: ${account.id} for ${email}`);

    return account;
  } catch (error) {
    logger.error('Error creating Connect account:', error);
    throw new Error(`Failed to create Connect account: ${error.message}`);
  }
}

/**
 * Create an account link for Stripe Connect onboarding
 * @param {string} accountId - Stripe account ID
 * @param {string} returnUrl - URL to return to after onboarding
 * @param {string} refreshUrl - URL to refresh if link expires
 * @returns {Promise<string>} Account link URL
 */
export async function createAccountLink(accountId, returnUrl, refreshUrl) {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return accountLink.url;
  } catch (error) {
    logger.error('Error creating account link:', error);
    throw new Error(`Failed to create account link: ${error.message}`);
  }
}

/**
 * Transfer funds to a mailer's Stripe Connect account
 * @param {number} amount - Amount in dollars
 * @param {string} stripeAccountId - Mailer's Stripe Connect account ID
 * @param {string} orderId - Order ID for metadata
 * @returns {Promise<Object>} Transfer object
 */
export async function createTransfer(amount, stripeAccountId, orderId) {
  try {
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      destination: stripeAccountId,
      metadata: {
        orderId,
      },
    });

    logger.info(`Transfer created: ${transfer.id} for $${amount} to ${stripeAccountId}`);

    return transfer;
  } catch (error) {
    logger.error('Error creating transfer:', error);
    throw new Error(`Failed to create transfer: ${error.message}`);
  }
}

/**
 * Verify webhook signature
 * @param {string} payload - Raw request body
 * @param {string} signature - Stripe signature header
 * @param {string} webhookSecret - Webhook secret
 * @returns {Object} Verified event object
 */
export function verifyWebhookSignature(payload, signature, webhookSecret) {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );

    return event;
  } catch (error) {
    logger.error('Webhook signature verification failed:', error);
    throw new Error(`Webhook signature verification failed: ${error.message}`);
  }
}

/**
 * Retrieve a payment intent
 * @param {string} paymentIntentId - Payment intent ID
 * @returns {Promise<Object>} Payment intent object
 */
export async function retrievePaymentIntent(paymentIntentId) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    logger.error('Error retrieving payment intent:', error);
    throw new Error(`Failed to retrieve payment intent: ${error.message}`);
  }
}

/**
 * Check if a Connect account is fully onboarded
 * @param {string} accountId - Stripe account ID
 * @returns {Promise<boolean>} True if account is fully onboarded
 */
export async function isAccountOnboarded(accountId) {
  try {
    const account = await stripe.accounts.retrieve(accountId);

    return account.details_submitted &&
           account.charges_enabled &&
           account.payouts_enabled;
  } catch (error) {
    logger.error('Error checking account onboarding status:', error);
    return false;
  }
}

/**
 * Refund a payment
 * @param {string} paymentIntentId - Payment intent ID to refund
 * @param {number} amount - Amount to refund in dollars (optional, full refund if not specified)
 * @returns {Promise<Object>} Refund object
 */
export async function createRefund(paymentIntentId, amount = null) {
  try {
    const refundData = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      refundData.amount = Math.round(amount * 100); // Convert to cents
    }

    const refund = await stripe.refunds.create(refundData);

    logger.info(`Refund created: ${refund.id} for payment intent ${paymentIntentId}`);

    return refund;
  } catch (error) {
    logger.error('Error creating refund:', error);
    throw new Error(`Failed to create refund: ${error.message}`);
  }
}

export default stripe;
