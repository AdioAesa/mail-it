/**
 * Simple integration tests
 * Run with: node test.js
 */

// Force mock mode for testing
process.env.MOCK_MODE = 'true';
process.env.NODE_ENV = 'development';

const integrations = require('./index');

async function runTests() {
  console.log('=== NearRun Integration Tests ===\n');

  // Initialize
  integrations.initialize();
  console.log('✅ Initialized\n');

  // Health check
  console.log('--- Health Check ---');
  const health = await integrations.healthCheck();
  console.log(JSON.stringify(health, null, 2));
  console.log('✅ Health check passed\n');

  // Test pricing
  console.log('--- Pricing Calculator ---');
  const pricing = integrations.calculateOrderPricing('BIRTHDAY', 'RUSH');
  console.log(JSON.stringify(pricing.breakdown, null, 2));
  console.log('✅ Pricing calculation passed\n');

  // Test Stripe payment
  console.log('--- Stripe Payment ---');
  try {
    const payment = await integrations.stripe.payments.createPaymentIntent(
      1000,
      'order_test_123',
      'test@example.com'
    );
    console.log(`Payment intent created: ${payment.id}`);
    console.log('✅ Stripe payment test passed\n');
  } catch (error) {
    console.error('❌ Stripe payment test failed:', error.message);
  }

  // Test Stripe Connect
  console.log('--- Stripe Connect ---');
  try {
    const account = await integrations.stripe.connect.createAccount(
      'mailer@example.com',
      'US',
      { mailerId: 'mailer_123' }
    );
    console.log(`Connect account created: ${account.id}`);

    const status = await integrations.stripe.connect.getAccountStatus(account.id);
    console.log(`Account complete: ${status.isComplete}`);
    console.log('✅ Stripe Connect test passed\n');
  } catch (error) {
    console.error('❌ Stripe Connect test failed:', error.message);
  }

  // Test Cloudinary
  console.log('--- Cloudinary Upload ---');
  try {
    const mockBuffer = Buffer.from('fake image data');
    const upload = await integrations.cloudinary.uploadImage(
      mockBuffer,
      'nearrun/cards',
      'test_card_123'
    );
    console.log(`Image uploaded: ${upload.public_id}`);

    const url = integrations.cloudinary.getOptimizedUrl(
      upload.public_id,
      'card_preview'
    );
    console.log(`Optimized URL: ${url}`);
    console.log('✅ Cloudinary test passed\n');
  } catch (error) {
    console.error('❌ Cloudinary test failed:', error.message);
  }

  // Test Geocoding
  console.log('--- Geocoding ---');
  try {
    const location = await integrations.geocoding.geocodeAddress(
      '123 Main St',
      'San Francisco',
      'CA',
      '94102'
    );
    console.log(`Geocoded: ${location.lat}, ${location.lng}`);

    const address = await integrations.geocoding.reverseGeocode(
      location.lat,
      location.lng
    );
    console.log(`Reverse geocoded: ${address.formattedAddress}`);

    const validation = await integrations.geocoding.validateAddress(
      '123 Main St',
      'San Francisco',
      'CA',
      '94102'
    );
    console.log(`Address valid: ${validation.valid}`);
    console.log('✅ Geocoding test passed\n');
  } catch (error) {
    console.error('❌ Geocoding test failed:', error.message);
  }

  // Test Distance calculations
  console.log('--- Distance Calculations ---');
  try {
    const distance = integrations.geocoding.distance.calculateDistance(
      37.7749, -122.4194,
      37.7849, -122.4094,
      'miles'
    );
    console.log(`Distance: ${distance} miles`);

    const mailers = [
      { id: 1, name: 'Bob', lat: 37.7749, lng: -122.4194 },
      { id: 2, name: 'Alice', lat: 37.8049, lng: -122.4394 }
    ];

    const sorted = integrations.geocoding.distance.sortByDistance(
      37.7749, -122.4194,
      mailers
    );
    console.log(`Nearest mailer: ${sorted[0].name} (${sorted[0].distance} miles)`);
    console.log('✅ Distance calculation test passed\n');
  } catch (error) {
    console.error('❌ Distance calculation test failed:', error.message);
  }

  // Test Email
  console.log('--- Email Notifications ---');
  try {
    const result = await integrations.notifications.sendOrderConfirmation(
      'customer@example.com',
      {
        customerName: 'John Doe',
        orderNumber: 'ORD-12345',
        cardType: 'Birthday',
        message: 'Happy Birthday!',
        recipientName: 'Jane Doe',
        deliveryAddress: '123 Main St, San Francisco, CA 94102',
        deliveryType: 'Standard',
        cardPrice: 700,
        deliveryFee: 0,
        totalAmount: 700,
        id: 'order_test_123'
      }
    );
    console.log(`Email sent: ${result.id}`);
    console.log('✅ Email test passed\n');
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
  }

  console.log('=== All Tests Complete ===');
}

// Run tests
runTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
