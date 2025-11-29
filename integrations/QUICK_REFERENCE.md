# NearRun Integrations - Quick Reference

## Setup

```javascript
const integrations = require('./integrations');
integrations.initialize();
```

## Stripe

### Payments
```javascript
// Create payment
const payment = await integrations.stripe.payments.createPaymentIntent(
  amountCents, orderId, customerEmail
);

// Confirm payment
const confirmed = await integrations.stripe.payments.confirmPayment(paymentIntentId);

// Refund
const refund = await integrations.stripe.payments.refundPayment(paymentIntentId);

// Calculate fees
const mailerPayout = integrations.stripe.payments.calculateMailerPayout(1000); // 700
const platformFee = integrations.stripe.payments.calculatePlatformFee(1000);   // 300
```

### Connect (Mailer Payouts)
```javascript
// Create account
const account = await integrations.stripe.connect.createAccount(email, 'US');

// Get onboarding link
const link = await integrations.stripe.connect.createAccountLink(
  accountId, refreshUrl, returnUrl
);

// Check status
const status = await integrations.stripe.connect.getAccountStatus(accountId);

// Transfer to mailer
const transfer = await integrations.stripe.connect.createTransfer(
  amountCents, accountId, orderId
);
```

### Webhooks
```javascript
// Verify signature
const event = integrations.stripe.webhooks.verifySignature(payload, signature);

// Handle event
const result = await integrations.stripe.webhooks.handleEvent(event);
```

## Cloudinary

```javascript
// Upload image
const result = await integrations.cloudinary.uploadImage(
  buffer, 'nearrun/cards', 'card_123'
);

// Upload from URL
const result = await integrations.cloudinary.uploadFromUrl(url, 'nearrun/cards');

// Get optimized URL
const url = integrations.cloudinary.getOptimizedUrl(publicId, 'card_preview');

// Get multiple sizes
const urls = integrations.cloudinary.getMultipleUrls(publicId);

// Delete
await integrations.cloudinary.deleteImage(publicId);
```

## Geocoding

```javascript
// Geocode address
const location = await integrations.geocoding.geocodeAddress(
  address, city, state, zip
);
// Returns: { lat, lng, formattedAddress, confidence }

// Reverse geocode
const address = await integrations.geocoding.reverseGeocode(lat, lng);

// Validate address
const validation = await integrations.geocoding.validateAddress(
  address, city, state, zip
);
// Returns: { valid, normalized, coordinates }

// Find nearby mailers
const nearby = integrations.geocoding.findNearbyMailers(
  lat, lng, mailers, radiusMiles
);

// Get closest
const closest = integrations.geocoding.getClosestMailer(lat, lng, mailers);
```

## Distance

```javascript
// Calculate distance
const miles = integrations.geocoding.distance.calculateDistance(
  lat1, lng1, lat2, lng2, 'miles'
);

// Check within radius
const isNear = integrations.geocoding.distance.isWithinRadius(
  centerLat, centerLng, pointLat, pointLng, radiusMiles
);

// Sort by distance
const sorted = integrations.geocoding.distance.sortByDistance(
  centerLat, centerLng, points
);

// Filter by radius
const nearby = integrations.geocoding.distance.filterByRadius(
  centerLat, centerLng, points, radiusMiles
);

// Get bounding box
const bounds = integrations.geocoding.distance.getBoundingBox(
  lat, lng, radiusMiles
);
```

## Email

```javascript
// Order confirmation
await integrations.notifications.sendOrderConfirmation(email, order);

// Mailer assigned
await integrations.notifications.sendMailerAssigned(email, order, mailer);

// Delivery confirmation
await integrations.notifications.sendDeliveryConfirmation(
  email, order, proofUrl, deliveryDetails
);

// New job alert
await integrations.notifications.sendMailerNewJob(email, job);

// Welcome mailer
await integrations.notifications.sendMailerWelcome(email, mailer);

// Custom email
await integrations.notifications.sendEmail(to, subject, html);
```

## Pricing

```javascript
// Calculate order pricing
const pricing = integrations.calculateOrderPricing(cardType, deliveryType);
// Returns: {
//   cardPrice, deliveryFee, totalAmount,
//   mailerPayout, platformFee,
//   breakdown: { ...dollars }
// }

// Get base prices
integrations.config.pricing.basePrices.BIRTHDAY;        // 700 cents
integrations.config.pricing.deliveryFees.RUSH;          // 800 cents
integrations.config.pricing.mailerPayoutPercent;        // 70
```

## Constants

```javascript
integrations.constants.ORDER_STATUSES;    // ['PENDING', 'PAID', ...]
integrations.constants.CARD_TYPES;        // ['BIRTHDAY', 'CHRISTMAS', ...]
integrations.constants.DELIVERY_TYPES;    // ['STANDARD', 'RUSH', 'SCHEDULED']
```

## Configuration

```javascript
integrations.config.env;                           // 'development' | 'production'
integrations.config.mockMode;                      // true | false
integrations.config.business.maxMessageLength;     // 500
integrations.config.business.rushOrderCutoffHour;  // 12
integrations.config.geocoding.defaultRadius;       // 10 miles
```

## Health Check

```javascript
const health = await integrations.healthCheck();
// Returns: { timestamp, environment, mockMode, services: {...} }
```

## Mock Mode

Set `MOCK_MODE=true` in `.env` to run without real API calls.

## Error Handling

All functions throw descriptive errors. Always use try/catch:

```javascript
try {
  const result = await integrations.stripe.payments.createPaymentIntent(...);
} catch (error) {
  console.error('Payment failed:', error.message);
}
```

## Image Transformation Presets

- `card_preview` - 600x800px for viewing
- `thumbnail` - 200x300px for lists
- `delivery_proof` - 800x600px with watermark
- `full_size` - Original quality
- `avatar` - 200x200px circle

## Cloudinary Folders

- `nearrun/cards` - Card images
- `nearrun/delivery-proofs` - Delivery photos
- `nearrun/templates` - Template images
- `nearrun/users` - User avatars

## Environment Variables

Required:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `RESEND_API_KEY`
- `EMAIL_FROM`

Optional:
- `NODE_ENV` (default: development)
- `MOCK_MODE` (default: false)
- `APP_URL` (for email links)

## Common Workflows

### 1. Process Order
```javascript
const pricing = integrations.calculateOrderPricing(cardType, deliveryType);
const location = await integrations.geocoding.geocodeAddress(...);
const payment = await integrations.stripe.payments.createPaymentIntent(...);
await integrations.notifications.sendOrderConfirmation(...);
```

### 2. Assign Mailer
```javascript
const nearby = integrations.geocoding.findNearbyMailers(...);
await integrations.notifications.sendMailerNewJob(...);
```

### 3. Complete Delivery
```javascript
const upload = await integrations.cloudinary.uploadImage(...);
const proofUrl = integrations.cloudinary.getOptimizedUrl(...);
const transfer = await integrations.stripe.connect.createTransfer(...);
await integrations.notifications.sendDeliveryConfirmation(...);
```

### 4. Onboard Mailer
```javascript
const account = await integrations.stripe.connect.createAccount(...);
const link = await integrations.stripe.connect.createAccountLink(...);
await integrations.notifications.sendMailerWelcome(...);
```

## Testing

```bash
npm install
node test.js
```

All tests run in mock mode by default.
