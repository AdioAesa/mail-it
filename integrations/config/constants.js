/**
 * Application constants for NearRun
 */

module.exports = {
  /**
   * Order status values
   */
  ORDER_STATUSES: [
    'PENDING',      // Order created, awaiting payment
    'PAID',         // Payment confirmed
    'ASSIGNED',     // Mailer accepted the job
    'PRINTING',     // Card is being printed
    'IN_TRANSIT',   // Mailer is delivering
    'DELIVERED',    // Card delivered successfully
    'CANCELLED',    // Order cancelled
    'REFUNDED'      // Order refunded
  ],

  /**
   * Card type categories
   */
  CARD_TYPES: [
    'BIRTHDAY',
    'CHRISTMAS',
    'THANK_YOU',
    'SYMPATHY',
    'CONGRATULATIONS',
    'ANNIVERSARY',
    'VALENTINES',
    'MOTHERS_DAY',
    'FATHERS_DAY',
    'GRADUATION',
    'NEW_BABY',
    'GET_WELL',
    'CUSTOM'
  ],

  /**
   * Delivery speed options
   */
  DELIVERY_TYPES: [
    'STANDARD',   // Next business day
    'RUSH',       // Same day (if available)
    'SCHEDULED'   // Specific future date
  ],

  /**
   * Mailer status values
   */
  MAILER_STATUSES: [
    'PENDING',    // Account created, not onboarded
    'ACTIVE',     // Onboarded and can accept jobs
    'INACTIVE',   // Temporarily not accepting jobs
    'SUSPENDED',  // Suspended by admin
    'BANNED'      // Permanently banned
  ],

  /**
   * Job status values (from mailer perspective)
   */
  JOB_STATUSES: [
    'AVAILABLE',  // Available for mailers to claim
    'CLAIMED',    // Mailer claimed but not confirmed
    'ACCEPTED',   // Mailer accepted the job
    'COMPLETED',  // Mailer marked as delivered
    'VERIFIED'    // Admin verified delivery
  ],

  /**
   * Payment intent statuses
   */
  PAYMENT_STATUSES: [
    'PENDING',
    'PROCESSING',
    'SUCCEEDED',
    'FAILED',
    'CANCELLED',
    'REFUNDED'
  ],

  /**
   * Stripe Connect account statuses
   */
  CONNECT_STATUSES: [
    'PENDING',      // Account created, needs onboarding
    'INCOMPLETE',   // Onboarding started but not finished
    'COMPLETE',     // Onboarding complete, can receive payouts
    'RESTRICTED',   // Account restricted by Stripe
    'REJECTED'      // Account rejected by Stripe
  ],

  /**
   * Cloudinary folder names
   */
  CLOUDINARY_FOLDERS: {
    CARDS: 'nearrun/cards',
    PROOFS: 'nearrun/delivery-proofs',
    TEMPLATES: 'nearrun/templates',
    USERS: 'nearrun/users'
  },

  /**
   * Image transformation presets
   */
  IMAGE_TRANSFORMS: {
    CARD_PREVIEW: 'card_preview',
    THUMBNAIL: 'thumbnail',
    DELIVERY_PROOF: 'delivery_proof'
  },

  /**
   * Email template names
   */
  EMAIL_TEMPLATES: {
    ORDER_CONFIRMATION: 'order-confirmation',
    ORDER_PAID: 'order-paid',
    MAILER_ASSIGNED: 'mailer-assigned',
    DELIVERY_CONFIRMATION: 'delivery-confirmation',
    NEW_JOB_ALERT: 'new-job-alert',
    MAILER_WELCOME: 'mailer-welcome'
  },

  /**
   * Webhook event types
   */
  WEBHOOK_EVENTS: {
    PAYMENT_SUCCEEDED: 'payment_intent.succeeded',
    PAYMENT_FAILED: 'payment_intent.payment_failed',
    ACCOUNT_UPDATED: 'account.updated',
    TRANSFER_CREATED: 'transfer.created',
    TRANSFER_FAILED: 'transfer.failed'
  },

  /**
   * Distance units
   */
  DISTANCE_UNITS: {
    MILES: 'miles',
    KILOMETERS: 'km'
  },

  /**
   * HTTP status codes
   */
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    SERVER_ERROR: 500
  }
};
