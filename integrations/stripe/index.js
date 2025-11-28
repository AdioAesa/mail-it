/**
 * Stripe Integration - Main Export
 * Consolidated access to all Stripe functionality
 */

const payments = require('./payments');
const connect = require('./connect');
const webhooks = require('./webhooks');
const config = require('../config');

/**
 * Initialize all Stripe services
 */
function initialize() {
  console.log('Initializing Stripe integration...');

  if (config.mockMode) {
    console.log('⚠️  Running in MOCK MODE - no real Stripe API calls');
  }

  payments.initializeStripe();

  console.log('Stripe integration initialized');
}

module.exports = {
  // Initialization
  initialize,

  // Payment operations
  payments: {
    createPaymentIntent: payments.createPaymentIntent,
    confirmPayment: payments.confirmPayment,
    getPaymentIntent: payments.getPaymentIntent,
    refundPayment: payments.refundPayment,
    calculatePlatformFee: payments.calculatePlatformFee,
    calculateMailerPayout: payments.calculateMailerPayout
  },

  // Connect operations (mailer payouts)
  connect: {
    createAccount: connect.createConnectAccount,
    createAccountLink: connect.createAccountLink,
    getAccountStatus: connect.getAccountStatus,
    createTransfer: connect.createTransfer,
    getTransfer: connect.getTransfer,
    updateAccount: connect.updateAccount,
    deleteAccount: connect.deleteAccount
  },

  // Webhook handlers
  webhooks: {
    verifySignature: webhooks.verifyWebhookSignature,
    handleEvent: webhooks.handleWebhookEvent,
    getConfig: webhooks.getWebhookConfig
  }
};
