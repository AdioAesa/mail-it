/**
 * Validation middleware for request bodies
 */

class ValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

/**
 * Validate order creation request
 */
export const validateCreateOrder = (req, res, next) => {
  const { cardType, message, recipientName, deliveryAddress, deliveryCity, deliveryState, deliveryZip, deliveryType } = req.body;
  const errors = {};

  if (!cardType || !['BIRTHDAY', 'CHRISTMAS', 'THANK_YOU', 'CUSTOM'].includes(cardType)) {
    errors.cardType = 'Card type must be BIRTHDAY, CHRISTMAS, THANK_YOU, or CUSTOM';
  }

  if (!message || message.trim().length === 0) {
    errors.message = 'Message is required';
  }

  if (message && message.length > 500) {
    errors.message = 'Message must be 500 characters or less';
  }

  if (!recipientName || recipientName.trim().length === 0) {
    errors.recipientName = 'Recipient name is required';
  }

  if (!deliveryAddress || deliveryAddress.trim().length === 0) {
    errors.deliveryAddress = 'Delivery address is required';
  }

  if (!deliveryCity || deliveryCity.trim().length === 0) {
    errors.deliveryCity = 'Delivery city is required';
  }

  if (!deliveryState || deliveryState.length !== 2) {
    errors.deliveryState = 'Delivery state must be a 2-letter code';
  }

  if (!deliveryZip || !/^\d{5}(-\d{4})?$/.test(deliveryZip)) {
    errors.deliveryZip = 'Delivery ZIP code must be in format 12345 or 12345-6789';
  }

  if (!deliveryType || !['STANDARD', 'RUSH', 'SCHEDULED'].includes(deliveryType)) {
    errors.deliveryType = 'Delivery type must be STANDARD, RUSH, or SCHEDULED';
  }

  if (deliveryType === 'SCHEDULED' && !req.body.scheduledDate) {
    errors.scheduledDate = 'Scheduled date is required for scheduled delivery';
  }

  if (cardType === 'CUSTOM' && !req.body.customImageUrl) {
    errors.customImageUrl = 'Custom image URL is required for custom cards';
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Validation failed', errors);
  }

  next();
};

/**
 * Validate mailer registration request
 */
export const validateMailerRegistration = (req, res, next) => {
  const { address, city, state, zipCode, radiusMiles } = req.body;
  const errors = {};

  if (!address || address.trim().length === 0) {
    errors.address = 'Address is required';
  }

  if (!city || city.trim().length === 0) {
    errors.city = 'City is required';
  }

  if (!state || state.length !== 2) {
    errors.state = 'State must be a 2-letter code';
  }

  if (!zipCode || !/^\d{5}(-\d{4})?$/.test(zipCode)) {
    errors.zipCode = 'ZIP code must be in format 12345 or 12345-6789';
  }

  if (radiusMiles && (radiusMiles < 1 || radiusMiles > 50)) {
    errors.radiusMiles = 'Radius must be between 1 and 50 miles';
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Validation failed', errors);
  }

  next();
};

/**
 * Validate payment intent creation
 */
export const validatePayment = (req, res, next) => {
  const { orderId } = req.params;

  if (!orderId) {
    throw new ValidationError('Order ID is required');
  }

  next();
};

/**
 * Validate job status update
 */
export const validateJobStatusUpdate = (req, res, next) => {
  const { status } = req.body;
  const validStatuses = ['PRINTING', 'IN_TRANSIT', 'DELIVERED'];

  if (!status || !validStatuses.includes(status)) {
    throw new ValidationError(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  next();
};

export { ValidationError };
