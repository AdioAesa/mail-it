# NearRun Integrations

Integration layer for NearRun - handles Stripe payments, Cloudinary images, geocoding, and email notifications.

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

### Required Environment Variables

**Stripe:**
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret

**Cloudinary:**
- `CLOUDINARY_CLOUD_NAME` - Your cloud name
- `CLOUDINARY_API_KEY` - API key
- `CLOUDINARY_API_SECRET` - API secret

**Email (Resend):**
- `RESEND_API_KEY` - Resend API key
- `EMAIL_FROM` - From email address (e.g., noreply@nearrun.app)

**Optional:**
- `GEOCODING_API_KEY` - If using paid geocoding service
- `NODE_ENV` - Environment (development/production)
- `MOCK_MODE` - Set to 'true' to run without real API calls

## Usage

### Initialize All Services

```javascript
const integrations = require('./integrations');

integrations.initialize();
```

### Stripe Payments

```javascript
const { stripe } = integrations;

// Create payment intent
const payment = await stripe.payments.createPaymentIntent(
  1000, // amount in cents
  'order_123',
  'customer@email.com'
);

// Confirm payment
const confirmed = await stripe.payments.confirmPayment(payment.id);

// Refund payment
const refund = await stripe.payments.refundPayment(payment.id, 500);
```

### Stripe Connect (Mailer Payouts)

```javascript
const { stripe } = integrations;

// Create Connect account for mailer
const account = await stripe.connect.createAccount(
  'mailer@email.com',
  'US'
);

// Get onboarding link
const link = await stripe.connect.createAccountLink(
  account.id,
  'https://nearrun.app/mailer/onboarding/refresh',
  'https://nearrun.app/mailer/onboarding/complete'
);

// Check account status
const status = await stripe.connect.getAccountStatus(account.id);

// Transfer to mailer
const transfer = await stripe.connect.createTransfer(
  700, // 70% of $10
  account.id,
  'order_123'
);
```

### Stripe Webhooks

```javascript
const { stripe } = integrations;

// In your webhook endpoint
app.post('/webhooks/stripe', async (req, res) => {
  const signature = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.verifySignature(
      req.rawBody,
      signature
    );

    const result = await stripe.webhooks.handleEvent(event);

    // result contains parsed event data
    console.log(result);

    res.json({ received: true });
  } catch (error) {
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});
```

### Cloudinary Images

```javascript
const { cloudinary } = integrations;

// Upload image from buffer
const result = await cloudinary.uploadImage(
  imageBuffer,
  'nearrun/cards',
  'card_123'
);

// Upload from URL
const result = await cloudinary.uploadFromUrl(
  'https://example.com/image.jpg',
  'nearrun/cards'
);

// Get optimized URL
const url = cloudinary.getOptimizedUrl(
  result.public_id,
  'card_preview'
);

// Get multiple sizes
const urls = cloudinary.getMultipleUrls(result.public_id, [
  'thumbnail',
  'card_preview',
  'full_size'
]);

// Delete image
await cloudinary.deleteImage(result.public_id);
```

### Geocoding

```javascript
const { geocoding } = integrations;

// Geocode address
const location = await geocoding.geocodeAddress(
  '123 Main St',
  'San Francisco',
  'CA',
  '94102'
);
// Returns: { lat: 37.7749, lng: -122.4194, ... }

// Reverse geocode
const address = await geocoding.reverseGeocode(37.7749, -122.4194);
// Returns: { address: '123 Main St', city: 'San Francisco', ... }

// Validate address
const validation = await geocoding.validateAddress(
  '123 Main St',
  'San Francisco',
  'CA',
  '94102'
);
// Returns: { valid: true, normalized: {...}, coordinates: {...} }

// Find nearby mailers
const mailers = [
  { id: 1, lat: 37.7749, lng: -122.4194 },
  { id: 2, lat: 37.7849, lng: -122.4094 }
];

const nearby = geocoding.findNearbyMailers(
  37.7749,
  -122.4194,
  mailers,
  10 // radius in miles
);
// Returns sorted array with distance property
```

### Distance Calculations

```javascript
const { geocoding } = integrations;

// Calculate distance
const distance = geocoding.distance.calculateDistance(
  37.7749, -122.4194,
  37.7849, -122.4094,
  'miles'
);

// Check if within radius
const isNear = geocoding.distance.isWithinRadius(
  37.7749, -122.4194,
  37.7849, -122.4094,
  5 // miles
);

// Sort by distance
const sorted = geocoding.distance.sortByDistance(
  37.7749, -122.4194,
  mailers
);
```

### Email Notifications

```javascript
const { notifications } = integrations;

// Send order confirmation
await notifications.sendOrderConfirmation(
  'customer@email.com',
  {
    customerName: 'John Doe',
    orderNumber: 'ORD-12345',
    cardType: 'Birthday',
    message: 'Happy Birthday!',
    recipientName: 'Jane Doe',
    deliveryAddress: '123 Main St, San Francisco, CA',
    deliveryType: 'Standard',
    cardPrice: 700,
    deliveryFee: 0,
    totalAmount: 700,
    id: 'order_123'
  }
);

// Send delivery confirmation
await notifications.sendDeliveryConfirmation(
  'customer@email.com',
  order,
  'https://res.cloudinary.com/nearrun/image/upload/proof_123.jpg',
  {
    deliveredAt: new Date(),
    mailerName: 'Bob Smith',
    notes: 'Delivered to recipient at front door'
  }
);

// Send job alert to mailer
await notifications.sendMailerNewJob(
  'mailer@email.com',
  {
    mailerName: 'Bob',
    payoutAmount: 700,
    cardType: 'Birthday',
    deliveryType: 'Standard',
    deliveryNeighborhood: 'Downtown',
    distance: 2.3,
    id: 'job_123'
  }
);
```

### Pricing Calculations

```javascript
const { calculateOrderPricing } = integrations;

const pricing = calculateOrderPricing('BIRTHDAY', 'RUSH');

console.log(pricing);
// {
//   cardPrice: 700,
//   deliveryFee: 800,
//   totalAmount: 1500,
//   mailerPayout: 1050,
//   platformFee: 450,
//   breakdown: {
//     cardPriceDollars: '7.00',
//     deliveryFeeDollars: '8.00',
//     totalDollars: '15.00',
//     mailerPayoutDollars: '10.50',
//     platformFeeDollars: '4.50'
//   }
// }
```

### Health Check

```javascript
const { healthCheck } = integrations;

const health = await healthCheck();

console.log(health);
// {
//   timestamp: '2025-01-15T10:30:00.000Z',
//   environment: 'development',
//   mockMode: false,
//   services: {
//     stripe: { status: 'ok', configured: true },
//     cloudinary: { status: 'ok', configured: true },
//     geocoding: { status: 'ok', provider: 'nominatim', configured: true },
//     email: { status: 'ok', configured: true }
//   }
// }
```

## Mock Mode

Set `MOCK_MODE=true` in your `.env` to run without making real API calls. Perfect for development and testing.

```bash
MOCK_MODE=true
```

In mock mode:
- Stripe returns mock payment intents and accounts
- Cloudinary returns mock upload results
- Geocoding returns San Francisco coordinates
- Emails are logged but not sent

## Constants

All app constants are available:

```javascript
const { constants } = integrations;

console.log(constants.ORDER_STATUSES);
// ['PENDING', 'PAID', 'ASSIGNED', 'PRINTING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'REFUNDED']

console.log(constants.CARD_TYPES);
// ['BIRTHDAY', 'CHRISTMAS', 'THANK_YOU', ...]
```

## Configuration

Access configuration values:

```javascript
const { config } = integrations;

console.log(config.pricing.basePrices.BIRTHDAY); // 700 cents
console.log(config.geocoding.defaultRadius); // 10 miles
console.log(config.business.maxMessageLength); // 500 characters
```

## Error Handling

All integration functions throw descriptive errors:

```javascript
try {
  const payment = await stripe.payments.createPaymentIntent(...);
} catch (error) {
  console.error('Payment failed:', error.message);
  // Handle error appropriately
}
```

## Rate Limiting

**Geocoding (Nominatim):**
- Automatically rate-limited to 1 request per second
- Free tier with no API key required
- Respects OpenStreetMap usage policy

**Stripe:**
- No client-side rate limiting (Stripe handles this)
- Uses idempotency keys to prevent duplicate charges

**Cloudinary:**
- No rate limiting for standard accounts
- Large file uploads may have size limits

**Resend:**
- Email sending has no client-side rate limits
- Check your Resend plan for sending limits

## Image Transformations

Available presets:
- `card_preview` - 600x800px for viewing
- `thumbnail` - 200x300px for lists
- `delivery_proof` - 800x600px with watermark
- `full_size` - Original quality
- `avatar` - 200x200px circle crop

## Testing

To test integrations in development:

```javascript
// Set mock mode
process.env.MOCK_MODE = 'true';

const integrations = require('./integrations');
integrations.initialize();

// All API calls will return mock data
const payment = await integrations.stripe.payments.createPaymentIntent(...);
console.log(payment.id); // 'pi_mock_1234567890'
```

## Production Checklist

Before deploying to production:

1. ✅ Set all required environment variables
2. ✅ Disable mock mode (`MOCK_MODE=false`)
3. ✅ Configure Stripe webhooks
4. ✅ Set up Cloudinary folders
5. ✅ Verify email sending domain
6. ✅ Test payment flows end-to-end
7. ✅ Test mailer onboarding flow
8. ✅ Verify geocoding works in production

## Support

For issues or questions:
- Email: dev@nearrun.app
- Documentation: https://docs.nearrun.app

## License

MIT
