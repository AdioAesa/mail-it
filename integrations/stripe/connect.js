/**
 * Stripe Connect for Mailer Payouts
 * Handles Express Connect accounts for mailers to receive payments
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
 * Create a Stripe Express Connect account for a mailer
 * @param {string} email - Mailer email
 * @param {string} country - Country code (e.g., 'US')
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} Connect account object
 */
async function createConnectAccount(email, country = 'US', metadata = {}) {
  console.log(`Creating Connect account for: ${email}`);

  if (config.mockMode) {
    return {
      id: `acct_mock_${Date.now()}`,
      email,
      country,
      type: 'express',
      charges_enabled: false,
      payouts_enabled: false,
      metadata
    };
  }

  initializeStripe();

  try {
    const account = await stripe.accounts.create({
      type: 'express',
      country,
      email,
      capabilities: {
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata
    });

    console.log(`Connect account created: ${account.id}`);
    return account;
  } catch (error) {
    console.error('Error creating Connect account:', error.message);
    throw new Error(`Failed to create Connect account: ${error.message}`);
  }
}

/**
 * Create an account link for onboarding
 * @param {string} accountId - Connect account ID
 * @param {string} refreshUrl - URL to redirect if link expires
 * @param {string} returnUrl - URL to redirect after completion
 * @returns {Promise<Object>} Account link object
 */
async function createAccountLink(accountId, refreshUrl, returnUrl) {
  console.log(`Creating account link for: ${accountId}`);

  if (config.mockMode) {
    return {
      object: 'account_link',
      url: `https://connect.stripe.com/express/onboarding/mock/${accountId}`,
      expires_at: Math.floor(Date.now() / 1000) + 3600
    };
  }

  initializeStripe();

  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    console.log(`Account link created for: ${accountId}`);
    return accountLink;
  } catch (error) {
    console.error('Error creating account link:', error.message);
    throw new Error(`Failed to create account link: ${error.message}`);
  }
}

/**
 * Get account status and check if onboarding is complete
 * @param {string} accountId - Connect account ID
 * @returns {Promise<Object>} Account status object
 */
async function getAccountStatus(accountId) {
  console.log(`Checking account status for: ${accountId}`);

  if (config.mockMode) {
    return {
      id: accountId,
      charges_enabled: true,
      payouts_enabled: true,
      details_submitted: true,
      requirements: {
        currently_due: [],
        errors: [],
        eventually_due: [],
        pending_verification: []
      }
    };
  }

  initializeStripe();

  try {
    const account = await stripe.accounts.retrieve(accountId);

    const status = {
      id: account.id,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
      requirements: account.requirements,
      isComplete: account.charges_enabled && account.payouts_enabled,
      hasErrors: account.requirements?.errors?.length > 0,
      needsAction: account.requirements?.currently_due?.length > 0
    };

    console.log(`Account status for ${accountId}: ${status.isComplete ? 'Complete' : 'Incomplete'}`);
    return status;
  } catch (error) {
    console.error('Error retrieving account status:', error.message);
    throw new Error(`Failed to retrieve account status: ${error.message}`);
  }
}

/**
 * Create a transfer to a mailer's Connect account
 * @param {number} amountCents - Amount to transfer in cents
 * @param {string} accountId - Connect account ID
 * @param {string} orderId - Order ID for metadata
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} Transfer object
 */
async function createTransfer(amountCents, accountId, orderId, metadata = {}) {
  console.log(`Creating transfer of $${amountCents / 100} to ${accountId} for order ${orderId}`);

  if (config.mockMode) {
    return {
      id: `tr_mock_${Date.now()}`,
      amount: amountCents,
      currency: 'usd',
      destination: accountId,
      metadata: { orderId, ...metadata }
    };
  }

  initializeStripe();

  try {
    const transfer = await stripe.transfers.create({
      amount: amountCents,
      currency: config.stripe.currency,
      destination: accountId,
      metadata: {
        orderId,
        ...metadata
      }
    }, {
      idempotencyKey: `transfer_${orderId}_${accountId}`
    });

    console.log(`Transfer created: ${transfer.id}`);
    return transfer;
  } catch (error) {
    console.error('Error creating transfer:', error.message);
    throw new Error(`Failed to create transfer: ${error.message}`);
  }
}

/**
 * Get transfer details
 * @param {string} transferId - Transfer ID
 * @returns {Promise<Object>} Transfer object
 */
async function getTransfer(transferId) {
  console.log(`Retrieving transfer: ${transferId}`);

  if (config.mockMode) {
    return {
      id: transferId,
      amount: 1000,
      currency: 'usd',
      destination: 'acct_mock_123',
      created: Math.floor(Date.now() / 1000)
    };
  }

  initializeStripe();

  try {
    const transfer = await stripe.transfers.retrieve(transferId);
    return transfer;
  } catch (error) {
    console.error('Error retrieving transfer:', error.message);
    throw new Error(`Failed to retrieve transfer: ${error.message}`);
  }
}

/**
 * Update Connect account information
 * @param {string} accountId - Connect account ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated account object
 */
async function updateAccount(accountId, updates) {
  console.log(`Updating Connect account: ${accountId}`);

  if (config.mockMode) {
    return {
      id: accountId,
      ...updates
    };
  }

  initializeStripe();

  try {
    const account = await stripe.accounts.update(accountId, updates);
    console.log(`Account updated: ${accountId}`);
    return account;
  } catch (error) {
    console.error('Error updating account:', error.message);
    throw new Error(`Failed to update account: ${error.message}`);
  }
}

/**
 * Delete/close a Connect account
 * @param {string} accountId - Connect account ID
 * @returns {Promise<Object>} Deletion confirmation
 */
async function deleteAccount(accountId) {
  console.log(`Deleting Connect account: ${accountId}`);

  if (config.mockMode) {
    return {
      id: accountId,
      deleted: true
    };
  }

  initializeStripe();

  try {
    const deleted = await stripe.accounts.del(accountId);
    console.log(`Account deleted: ${accountId}`);
    return deleted;
  } catch (error) {
    console.error('Error deleting account:', error.message);
    throw new Error(`Failed to delete account: ${error.message}`);
  }
}

module.exports = {
  createConnectAccount,
  createAccountLink,
  getAccountStatus,
  createTransfer,
  getTransfer,
  updateAccount,
  deleteAccount
};
