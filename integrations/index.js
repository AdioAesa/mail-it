/**
 * MailIt Integrations
 * Main entry point for all integration services
 */

const stripe = require('./stripe');
const cloudinary = require('./cloudinary');
const geocoding = require('./geocoding');
const notifications = require('./notifications/email');
const config = require('./config');
const constants = require('./config/constants');

/**
 * Initialize all integrations
 */
function initialize() {
  console.log('Initializing MailIt integrations...');
  console.log(`Environment: ${config.env}`);
  console.log(`Mock Mode: ${config.mockMode}`);

  stripe.initialize();
  cloudinary.initialize();
  notifications.initialize();

  console.log('All integrations initialized successfully');
}

/**
 * Health check for all services
 * @returns {Promise<Object>} Health status for each service
 */
async function healthCheck() {
  const health = {
    timestamp: new Date().toISOString(),
    environment: config.env,
    mockMode: config.mockMode,
    services: {}
  };

  // Check Stripe
  try {
    if (!config.mockMode && config.stripe.secretKey) {
      health.services.stripe = { status: 'ok', configured: true };
    } else if (config.mockMode) {
      health.services.stripe = { status: 'mock', configured: true };
    } else {
      health.services.stripe = { status: 'not_configured', configured: false };
    }
  } catch (error) {
    health.services.stripe = { status: 'error', error: error.message };
  }

  // Check Cloudinary
  try {
    if (!config.mockMode && config.cloudinary.cloudName) {
      health.services.cloudinary = { status: 'ok', configured: true };
    } else if (config.mockMode) {
      health.services.cloudinary = { status: 'mock', configured: true };
    } else {
      health.services.cloudinary = { status: 'not_configured', configured: false };
    }
  } catch (error) {
    health.services.cloudinary = { status: 'error', error: error.message };
  }

  // Check Geocoding
  try {
    health.services.geocoding = {
      status: 'ok',
      provider: config.geocoding.provider,
      configured: true
    };
  } catch (error) {
    health.services.geocoding = { status: 'error', error: error.message };
  }

  // Check Email
  try {
    if (!config.mockMode && config.email.apiKey) {
      health.services.email = { status: 'ok', configured: true };
    } else if (config.mockMode) {
      health.services.email = { status: 'mock', configured: true };
    } else {
      health.services.email = { status: 'not_configured', configured: false };
    }
  } catch (error) {
    health.services.email = { status: 'error', error: error.message };
  }

  return health;
}

/**
 * Get pricing for an order
 * @param {string} cardType - Card type
 * @param {string} deliveryType - Delivery type
 * @returns {Object} Pricing breakdown
 */
function calculateOrderPricing(cardType, deliveryType) {
  const cardPrice = config.pricing.basePrices[cardType] || config.pricing.basePrices.CUSTOM;
  const deliveryFee = config.pricing.deliveryFees[deliveryType] || 0;
  const totalAmount = cardPrice + deliveryFee;

  const mailerPayout = Math.round(totalAmount * (config.pricing.mailerPayoutPercent / 100));
  const platformFee = totalAmount - mailerPayout;

  return {
    cardPrice,
    deliveryFee,
    totalAmount,
    mailerPayout,
    platformFee,
    breakdown: {
      cardPriceDollars: (cardPrice / 100).toFixed(2),
      deliveryFeeDollars: (deliveryFee / 100).toFixed(2),
      totalDollars: (totalAmount / 100).toFixed(2),
      mailerPayoutDollars: (mailerPayout / 100).toFixed(2),
      platformFeeDollars: (platformFee / 100).toFixed(2)
    }
  };
}

module.exports = {
  // Initialization
  initialize,
  healthCheck,

  // Services
  stripe,
  cloudinary,
  geocoding,
  notifications,

  // Configuration
  config,
  constants,

  // Utilities
  calculateOrderPricing
};
