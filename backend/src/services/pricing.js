/**
 * Pricing calculation service
 *
 * Base prices:
 * - Birthday: $7
 * - Christmas: $8
 * - Thank You: $6
 * - Custom: $10
 *
 * Delivery fees:
 * - Standard: $0
 * - Rush: $8
 * - Scheduled: $2
 *
 * Platform split:
 * - Mailer: 70%
 * - Platform: 30%
 */

const BASE_PRICES = {
  BIRTHDAY: 7.00,
  CHRISTMAS: 8.00,
  THANK_YOU: 6.00,
  CUSTOM: 10.00
};

const DELIVERY_FEES = {
  STANDARD: 0.00,
  RUSH: 8.00,
  SCHEDULED: 2.00
};

const PLATFORM_FEE_PERCENTAGE = 0.30; // 30%
const MAILER_PAYOUT_PERCENTAGE = 0.70; // 70%

/**
 * Calculate the total order price
 * @param {string} cardType - Card type (BIRTHDAY, CHRISTMAS, THANK_YOU, CUSTOM)
 * @param {string} deliveryType - Delivery type (STANDARD, RUSH, SCHEDULED)
 * @returns {Object} Pricing breakdown
 */
export function calculateOrderPrice(cardType, deliveryType) {
  const basePrice = BASE_PRICES[cardType] || BASE_PRICES.CUSTOM;
  const deliveryFee = DELIVERY_FEES[deliveryType] || DELIVERY_FEES.STANDARD;
  const totalPrice = basePrice + deliveryFee;

  return {
    basePrice: parseFloat(basePrice.toFixed(2)),
    deliveryFee: parseFloat(deliveryFee.toFixed(2)),
    totalPrice: parseFloat(totalPrice.toFixed(2))
  };
}

/**
 * Calculate the mailer's payout (70% of total)
 * @param {number} totalPrice - Total order price
 * @returns {number} Mailer payout amount
 */
export function calculateMailerPayout(totalPrice) {
  const payout = totalPrice * MAILER_PAYOUT_PERCENTAGE;
  return parseFloat(payout.toFixed(2));
}

/**
 * Calculate the platform fee (30% of total)
 * @param {number} totalPrice - Total order price
 * @returns {number} Platform fee amount
 */
export function calculatePlatformFee(totalPrice) {
  const fee = totalPrice * PLATFORM_FEE_PERCENTAGE;
  return parseFloat(fee.toFixed(2));
}

/**
 * Get complete pricing breakdown for an order
 * @param {string} cardType - Card type
 * @param {string} deliveryType - Delivery type
 * @returns {Object} Complete pricing breakdown
 */
export function getPricingBreakdown(cardType, deliveryType) {
  const { basePrice, deliveryFee, totalPrice } = calculateOrderPrice(cardType, deliveryType);
  const mailerPayout = calculateMailerPayout(totalPrice);
  const platformFee = calculatePlatformFee(totalPrice);

  return {
    basePrice,
    deliveryFee,
    totalPrice,
    mailerPayout,
    platformFee
  };
}
