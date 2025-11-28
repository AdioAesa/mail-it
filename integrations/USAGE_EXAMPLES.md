# MailIt Integrations - Usage Examples

Complete real-world examples for common workflows.

## Complete Order Flow

```javascript
const integrations = require('@mailit/integrations');

// Initialize once at app startup
integrations.initialize();

/**
 * Customer places an order
 */
async function placeOrder(orderData) {
  // 1. Calculate pricing
  const pricing = integrations.calculateOrderPricing(
    orderData.cardType,
    orderData.deliveryType
  );

  // 2. Geocode delivery address
  const location = await integrations.geocoding.geocodeAddress(
    orderData.address,
    orderData.city,
    orderData.state,
    orderData.zip
  );

  // 3. Create payment intent
  const payment = await integrations.stripe.payments.createPaymentIntent(
    pricing.totalAmount,
    orderData.orderId,
    orderData.customerEmail,
    {
      cardType: orderData.cardType,
      deliveryType: orderData.deliveryType
    }
  );

  // 4. Save order to database (your code)
  const order = await saveOrderToDatabase({
    ...orderData,
    ...pricing,
    location,
    paymentIntentId: payment.id
  });

  // 5. Send confirmation email
  await integrations.notifications.sendOrderConfirmation(
    orderData.customerEmail,
    order
  );

  return {
    order,
    clientSecret: payment.client_secret
  };
}
```

## Payment Webhook Handler

```javascript
/**
 * Handle Stripe payment webhook
 */
async function handleStripeWebhook(req, res) {
  const signature = req.headers['stripe-signature'];

  try {
    // 1. Verify webhook signature
    const event = integrations.stripe.webhooks.verifySignature(
      req.rawBody,
      signature
    );

    // 2. Handle event
    const result = await integrations.stripe.webhooks.handleEvent(event);

    // 3. Process based on event type
    switch (result.type) {
      case 'payment.succeeded':
        // Update order status
        await updateOrderStatus(result.orderId, 'PAID');

        // Find nearby mailers
        const order = await getOrderById(result.orderId);
        const mailers = await findMailersNearOrder(order);

        // Notify mailers of new job
        for (const mailer of mailers.slice(0, 5)) {
          await integrations.notifications.sendMailerNewJob(
            mailer.email,
            {
              ...order,
              mailerName: mailer.name,
              payoutAmount: order.mailerPayout,
              distance: mailer.distance
            }
          );
        }
        break;

      case 'payment.failed':
        await updateOrderStatus(result.orderId, 'PAYMENT_FAILED');
        // Notify customer
        break;

      case 'account.updated':
        if (result.isComplete) {
          await updateMailerStatus(result.accountId, 'ACTIVE');
        }
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
}
```

## Mailer Onboarding Flow

```javascript
/**
 * Onboard a new mailer with Stripe Connect
 */
async function onboardMailer(mailerData) {
  // 1. Create Connect account
  const account = await integrations.stripe.connect.createAccount(
    mailerData.email,
    'US',
    { mailerId: mailerData.id }
  );

  // 2. Save account ID to database
  await updateMailer(mailerData.id, {
    stripeAccountId: account.id,
    status: 'PENDING'
  });

  // 3. Create onboarding link
  const link = await integrations.stripe.connect.createAccountLink(
    account.id,
    `${process.env.APP_URL}/mailer/onboarding/refresh`,
    `${process.env.APP_URL}/mailer/onboarding/complete`
  );

  // 4. Send welcome email
  await integrations.notifications.sendMailerWelcome(
    mailerData.email,
    mailerData
  );

  return {
    onboardingUrl: link.url,
    expiresAt: link.expires_at
  };
}

/**
 * Check if mailer onboarding is complete
 */
async function checkMailerOnboarding(mailerId) {
  const mailer = await getMailerById(mailerId);

  const status = await integrations.stripe.connect.getAccountStatus(
    mailer.stripeAccountId
  );

  if (status.isComplete) {
    await updateMailer(mailerId, {
      status: 'ACTIVE',
      onboardingComplete: true
    });
  }

  return status;
}
```

## Job Assignment and Payout

```javascript
/**
 * Mailer accepts a job
 */
async function acceptJob(jobId, mailerId) {
  const job = await getJobById(jobId);
  const mailer = await getMailerById(mailerId);

  // 1. Verify mailer is close enough
  const distance = integrations.geocoding.distance.calculateDistance(
    mailer.lat,
    mailer.lng,
    job.deliveryLat,
    job.deliveryLng,
    'miles'
  );

  if (distance > mailer.serviceRadius) {
    throw new Error('Job is outside your service area');
  }

  // 2. Assign job
  await updateJob(jobId, {
    mailerId,
    status: 'ACCEPTED',
    acceptedAt: new Date()
  });

  // 3. Update order
  await updateOrder(job.orderId, {
    status: 'ASSIGNED',
    assignedMailerId: mailerId
  });

  // 4. Notify customer
  const order = await getOrderById(job.orderId);
  await integrations.notifications.sendMailerAssigned(
    order.customerEmail,
    order,
    mailer
  );

  return { success: true, distance };
}

/**
 * Mailer completes delivery and uploads proof
 */
async function completeDelivery(jobId, proofImageBuffer, notes) {
  const job = await getJobById(jobId);
  const order = await getOrderById(job.orderId);

  // 1. Upload delivery proof to Cloudinary
  const upload = await integrations.cloudinary.uploadImage(
    proofImageBuffer,
    'mailit/delivery-proofs',
    `proof_${job.orderId}_${Date.now()}`
  );

  // Get optimized URL with watermark
  const proofUrl = integrations.cloudinary.getOptimizedUrl(
    upload.public_id,
    'delivery_proof'
  );

  // 2. Update job and order
  await updateJob(jobId, {
    status: 'COMPLETED',
    completedAt: new Date(),
    proofImageUrl: proofUrl,
    deliveryNotes: notes
  });

  await updateOrder(job.orderId, {
    status: 'DELIVERED',
    deliveredAt: new Date()
  });

  // 3. Transfer payout to mailer
  const mailer = await getMailerById(job.mailerId);

  const transfer = await integrations.stripe.connect.createTransfer(
    order.mailerPayout,
    mailer.stripeAccountId,
    order.id,
    { jobId: job.id }
  );

  await updateJob(jobId, {
    transferId: transfer.id,
    payoutStatus: 'COMPLETED'
  });

  // 4. Send delivery confirmation to customer
  await integrations.notifications.sendDeliveryConfirmation(
    order.customerEmail,
    order,
    proofUrl,
    {
      deliveredAt: new Date(),
      mailerName: mailer.name,
      notes
    }
  );

  return { success: true, proofUrl, transfer };
}
```

## Finding Available Mailers

```javascript
/**
 * Find mailers available for a delivery
 */
async function findAvailableMailers(order) {
  // 1. Get all active mailers from database
  const allMailers = await getActiveMailers();

  // 2. Filter by distance
  const nearbyMailers = integrations.geocoding.findNearbyMailers(
    order.deliveryLat,
    order.deliveryLng,
    allMailers,
    20 // 20 mile radius
  );

  // 3. Filter by availability
  const availableMailers = [];

  for (const mailer of nearbyMailers) {
    const activeJobs = await getActiveJobsForMailer(mailer.id);

    if (activeJobs.length < integrations.config.business.maxActiveOrders) {
      availableMailers.push({
        ...mailer,
        activeJobsCount: activeJobs.length,
        estimatedPayout: order.mailerPayout
      });
    }
  }

  // 4. Sort by distance and rating
  return availableMailers.sort((a, b) => {
    // Prioritize highly rated mailers within 5 miles
    if (a.distance <= 5 && b.distance <= 5) {
      return b.rating - a.rating;
    }
    return a.distance - b.distance;
  });
}
```

## Batch Geocoding for Mailer Signup

```javascript
/**
 * Geocode mailer's service area
 */
async function setupMailerServiceArea(mailerId, address) {
  // 1. Geocode home address
  const location = await integrations.geocoding.geocodeAddress(
    address.street,
    address.city,
    address.state,
    address.zip
  );

  // 2. Calculate service area bounds
  const bounds = integrations.geocoding.distance.getBoundingBox(
    location.lat,
    location.lng,
    integrations.config.geocoding.defaultRadius
  );

  // 3. Update mailer
  await updateMailer(mailerId, {
    lat: location.lat,
    lng: location.lng,
    serviceRadius: integrations.config.geocoding.defaultRadius,
    serviceBounds: bounds,
    addressVerified: true
  });

  return location;
}
```

## Refund Handling

```javascript
/**
 * Process order refund
 */
async function refundOrder(orderId, reason = 'requested_by_customer') {
  const order = await getOrderById(orderId);

  if (order.status === 'DELIVERED') {
    throw new Error('Cannot refund delivered orders');
  }

  // 1. Process refund via Stripe
  const refund = await integrations.stripe.payments.refundPayment(
    order.paymentIntentId,
    order.totalAmount, // full refund
    reason
  );

  // 2. If mailer was paid, reverse transfer
  if (order.status === 'ASSIGNED' || order.status === 'IN_TRANSIT') {
    const job = await getJobByOrderId(orderId);

    if (job.transferId) {
      // Create reversal (this is handled separately via Stripe API)
      // Note: Actual reversal logic would go here
      console.log(`Would reverse transfer ${job.transferId}`);
    }
  }

  // 3. Update order status
  await updateOrder(orderId, {
    status: 'REFUNDED',
    refundedAt: new Date(),
    refundId: refund.id
  });

  // 4. Cancel any pending jobs
  const jobs = await getJobsByOrderId(orderId);
  for (const job of jobs) {
    if (job.status !== 'COMPLETED') {
      await updateJob(job.id, { status: 'CANCELLED' });
    }
  }

  // 5. Notify customer
  await integrations.notifications.sendEmail(
    order.customerEmail,
    'Order Refunded',
    `Your order ${order.orderNumber} has been refunded. The amount will appear in your account within 5-10 business days.`
  );

  return { success: true, refund };
}
```

## Card Image Upload

```javascript
/**
 * Upload custom card design
 */
async function uploadCustomCard(orderId, imageBuffer) {
  // 1. Upload to Cloudinary with multiple sizes
  const result = await integrations.cloudinary.uploadWithUrls(
    imageBuffer,
    'mailit/cards',
    `card_${orderId}`
  );

  // 2. Update order with image URLs
  await updateOrder(orderId, {
    cardImageId: result.public_id,
    cardImageUrls: result.urls
  });

  return {
    publicId: result.public_id,
    urls: result.urls
  };
}

/**
 * Get card image for printing
 */
async function getCardForPrinting(orderId) {
  const order = await getOrderById(orderId);

  if (!order.cardImageId) {
    throw new Error('No card image found');
  }

  // Get full-size URL for printing
  const printUrl = integrations.cloudinary.getOptimizedUrl(
    order.cardImageId,
    'full_size'
  );

  return {
    url: printUrl,
    message: order.message,
    recipientName: order.recipientName
  };
}
```

## Health Monitoring

```javascript
/**
 * Health check endpoint
 */
app.get('/health', async (req, res) => {
  const health = await integrations.healthCheck();

  const allHealthy = Object.values(health.services).every(
    service => service.status === 'ok' || service.status === 'mock'
  );

  res.status(allHealthy ? 200 : 503).json(health);
});
```

## Error Handling Best Practices

```javascript
/**
 * Centralized error handler for integrations
 */
async function withErrorHandling(operation, fallback = null) {
  try {
    return await operation();
  } catch (error) {
    console.error('Integration error:', error.message);

    // Log to monitoring service
    await logError(error, {
      operation: operation.name,
      timestamp: new Date()
    });

    // Return fallback or rethrow
    if (fallback !== null) {
      return fallback;
    }

    throw error;
  }
}

// Usage
const payment = await withErrorHandling(
  () => integrations.stripe.payments.createPaymentIntent(...),
  null // or provide a default value
);
```

These examples demonstrate real-world integration patterns for MailIt's core workflows.
