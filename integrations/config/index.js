/**
 * Central configuration for NearRun integrations
 */

require('dotenv').config();

const config = {
  /**
   * Environment
   */
  env: process.env.NODE_ENV || 'development',
  mockMode: process.env.MOCK_MODE === 'true',

  /**
   * Stripe configuration
   */
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    platformFeePercent: 30, // 30% platform fee
    currency: 'usd',
    apiVersion: '2023-10-16'
  },

  /**
   * Cloudinary configuration
   */
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
    uploadPreset: 'nearrun_default'
  },

  /**
   * Email configuration (Resend)
   */
  email: {
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.EMAIL_FROM || 'noreply@nearrun.app',
    replyTo: process.env.EMAIL_REPLY_TO || 'support@nearrun.app'
  },

  /**
   * Geocoding configuration
   */
  geocoding: {
    apiKey: process.env.GEOCODING_API_KEY,
    defaultRadius: 10, // miles
    maxRadius: 50, // miles
    minRadius: 1, // miles
    provider: 'nominatim', // OpenStreetMap Nominatim (free)
    nominatimUrl: 'https://nominatim.openstreetmap.org',
    userAgent: 'NearRun-App/1.0',
    rateLimit: 1000 // milliseconds between requests (Nominatim requires 1 req/sec)
  },

  /**
   * Pricing configuration (all prices in cents)
   */
  pricing: {
    basePrices: {
      BIRTHDAY: 700,           // $7.00
      CHRISTMAS: 800,          // $8.00
      THANK_YOU: 600,          // $6.00
      SYMPATHY: 700,           // $7.00
      CONGRATULATIONS: 700,    // $7.00
      ANNIVERSARY: 800,        // $8.00
      VALENTINES: 800,         // $8.00
      MOTHERS_DAY: 800,        // $8.00
      FATHERS_DAY: 800,        // $8.00
      GRADUATION: 800,         // $8.00
      NEW_BABY: 700,           // $7.00
      GET_WELL: 600,           // $6.00
      CUSTOM: 1000             // $10.00
    },
    deliveryFees: {
      STANDARD: 0,             // Free - next business day
      RUSH: 800,               // $8.00 - same day
      SCHEDULED: 200           // $2.00 - specific date
    },
    mailerPayoutPercent: 70,   // 70% goes to mailer
    platformFeePercent: 30,    // 30% platform fee
    minimumOrder: 500          // $5.00 minimum
  },

  /**
   * Business rules
   */
  business: {
    maxMessageLength: 500,              // characters
    maxCustomInstructions: 200,         // characters
    rushOrderCutoffHour: 12,           // noon local time
    standardDeliveryDays: 1,           // next business day
    mailerAcceptanceTimeoutMinutes: 30,// time to accept before reassigning
    deliveryProofRequired: true,       // require photo proof
    minMailerRating: 4.0,              // minimum rating to stay active
    maxActiveOrders: 10                // max orders per mailer at once
  },

  /**
   * Retry configuration
   */
  retry: {
    maxAttempts: 3,
    baseDelayMs: 1000,
    maxDelayMs: 10000,
    exponentialBackoff: true
  },

  /**
   * Validation rules
   */
  validation: {
    phone: /^\+?1?\d{10,14}$/,
    zip: /^\d{5}(-\d{4})?$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  }
};

/**
 * Validate required configuration
 */
function validateConfig() {
  const errors = [];

  if (!config.mockMode) {
    if (!config.stripe.secretKey) {
      errors.push('STRIPE_SECRET_KEY is required');
    }
    if (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
      errors.push('Cloudinary credentials are required');
    }
    if (!config.email.apiKey) {
      errors.push('RESEND_API_KEY is required');
    }
  }

  if (errors.length > 0) {
    console.error('Configuration validation failed:');
    errors.forEach(err => console.error(`  - ${err}`));
    if (config.env === 'production') {
      throw new Error('Invalid configuration for production environment');
    }
  }

  return errors.length === 0;
}

// Validate on load
validateConfig();

module.exports = config;
