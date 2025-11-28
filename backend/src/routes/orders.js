import express from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateCreateOrder } from '../middleware/validate.js';
import { generateOrderNumber } from '../utils/generateOrderNumber.js';
import { geocodeAddress } from '../services/geocoding.js';
import { getPricingBreakdown } from '../services/pricing.js';
import { createPaymentIntent } from '../services/stripe.js';
import logger from '../utils/logger.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/orders
 * Create a new order
 */
router.post('/', validateCreateOrder, asyncHandler(async (req, res) => {
  const {
    templateId,
    cardType,
    message,
    customImageUrl,
    recipientName,
    deliveryAddress,
    deliveryCity,
    deliveryState,
    deliveryZip,
    deliveryType,
    scheduledDate
  } = req.body;

  const userId = req.user.id;

  // Geocode the delivery address
  let deliveryLat = null;
  let deliveryLng = null;

  try {
    const coords = await geocodeAddress(deliveryAddress, deliveryCity, deliveryState, deliveryZip);
    deliveryLat = coords.latitude;
    deliveryLng = coords.longitude;
  } catch (error) {
    logger.warn(`Failed to geocode address for order: ${error.message}`);
    // Continue without coordinates - matching will be limited
  }

  // Calculate pricing
  const pricing = getPricingBreakdown(cardType, deliveryType);

  // Generate unique order number
  let orderNumber;
  let isUnique = false;

  while (!isUnique) {
    orderNumber = generateOrderNumber();
    const existing = await prisma.order.findUnique({
      where: { orderNumber }
    });
    isUnique = !existing;
  }

  // Create order
  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId,
      templateId: templateId || null,
      cardType,
      message,
      customImageUrl,
      recipientName,
      deliveryAddress,
      deliveryCity,
      deliveryState,
      deliveryZip,
      deliveryLat,
      deliveryLng,
      deliveryType,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      basePrice: pricing.basePrice,
      deliveryFee: pricing.deliveryFee,
      totalPrice: pricing.totalPrice,
      platformFee: pricing.platformFee,
      mailerPayout: pricing.mailerPayout,
      status: 'PENDING'
    },
    include: {
      template: true
    }
  });

  logger.info(`Order created: ${order.orderNumber} by user ${userId}`);

  res.status(201).json({
    success: true,
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      cardType: order.cardType,
      message: order.message,
      recipientName: order.recipientName,
      deliveryAddress: order.deliveryAddress,
      deliveryCity: order.deliveryCity,
      deliveryState: order.deliveryState,
      deliveryZip: order.deliveryZip,
      deliveryType: order.deliveryType,
      scheduledDate: order.scheduledDate,
      totalPrice: order.totalPrice,
      basePrice: order.basePrice,
      deliveryFee: order.deliveryFee,
      template: order.template,
      customImageUrl: order.customImageUrl,
      createdAt: order.createdAt
    }
  });
}));

/**
 * GET /api/orders
 * List user's orders
 */
router.get('/', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { status, limit = 50, offset = 0 } = req.query;

  const where = { userId };

  if (status) {
    where.status = status;
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      template: true,
      mailer: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: parseInt(limit),
    skip: parseInt(offset)
  });

  const total = await prisma.order.count({ where });

  res.json({
    success: true,
    orders: orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      cardType: order.cardType,
      recipientName: order.recipientName,
      deliveryCity: order.deliveryCity,
      deliveryState: order.deliveryState,
      deliveryType: order.deliveryType,
      totalPrice: order.totalPrice,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      deliveredAt: order.deliveredAt,
      template: order.template,
      mailer: order.mailer ? {
        name: `${order.mailer.user.firstName} ${order.mailer.user.lastName}`
      } : null
    })),
    pagination: {
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    }
  });
}));

/**
 * GET /api/orders/:id
 * Get order details
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const order = await prisma.order.findFirst({
    where: {
      id,
      userId
    },
    include: {
      template: true,
      mailer: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              phoneNumber: true
            }
          }
        }
      }
    }
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found'
    });
  }

  res.json({
    success: true,
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      cardType: order.cardType,
      message: order.message,
      recipientName: order.recipientName,
      deliveryAddress: order.deliveryAddress,
      deliveryCity: order.deliveryCity,
      deliveryState: order.deliveryState,
      deliveryZip: order.deliveryZip,
      deliveryType: order.deliveryType,
      scheduledDate: order.scheduledDate,
      basePrice: order.basePrice,
      deliveryFee: order.deliveryFee,
      totalPrice: order.totalPrice,
      template: order.template,
      customImageUrl: order.customImageUrl,
      mailer: order.mailer ? {
        name: `${order.mailer.user.firstName} ${order.mailer.user.lastName}`,
        phone: order.mailer.user.phoneNumber
      } : null,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      assignedAt: order.assignedAt,
      printedAt: order.printedAt,
      inTransitAt: order.inTransitAt,
      deliveredAt: order.deliveredAt,
      deliveryProofUrl: order.deliveryProofUrl
    }
  });
}));

/**
 * POST /api/orders/:id/pay
 * Create payment intent for order
 */
router.post('/:id/pay', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const order = await prisma.order.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found'
    });
  }

  if (order.status !== 'PENDING') {
    return res.status(400).json({
      success: false,
      error: 'Order cannot be paid',
      message: `Order status is ${order.status}`
    });
  }

  // Create payment intent
  const { clientSecret, paymentIntentId } = await createPaymentIntent(
    order.totalPrice,
    order.id,
    req.user.email
  );

  // Update order with payment intent ID
  await prisma.order.update({
    where: { id },
    data: {
      stripePaymentId: paymentIntentId
    }
  });

  logger.info(`Payment intent created for order ${order.orderNumber}`);

  res.json({
    success: true,
    clientSecret,
    paymentIntentId
  });
}));

/**
 * PUT /api/orders/:id
 * Update order (before payment only)
 */
router.put('/:id', validateCreateOrder, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const order = await prisma.order.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found'
    });
  }

  if (order.status !== 'PENDING') {
    return res.status(400).json({
      success: false,
      error: 'Cannot update order',
      message: 'Only pending orders can be updated'
    });
  }

  const {
    templateId,
    cardType,
    message,
    customImageUrl,
    recipientName,
    deliveryAddress,
    deliveryCity,
    deliveryState,
    deliveryZip,
    deliveryType,
    scheduledDate
  } = req.body;

  // Recalculate pricing if delivery type changed
  const pricing = getPricingBreakdown(cardType, deliveryType);

  // Re-geocode if address changed
  let deliveryLat = order.deliveryLat;
  let deliveryLng = order.deliveryLng;

  if (
    deliveryAddress !== order.deliveryAddress ||
    deliveryCity !== order.deliveryCity ||
    deliveryState !== order.deliveryState ||
    deliveryZip !== order.deliveryZip
  ) {
    try {
      const coords = await geocodeAddress(deliveryAddress, deliveryCity, deliveryState, deliveryZip);
      deliveryLat = coords.latitude;
      deliveryLng = coords.longitude;
    } catch (error) {
      logger.warn(`Failed to geocode updated address: ${error.message}`);
    }
  }

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: {
      templateId: templateId || null,
      cardType,
      message,
      customImageUrl,
      recipientName,
      deliveryAddress,
      deliveryCity,
      deliveryState,
      deliveryZip,
      deliveryLat,
      deliveryLng,
      deliveryType,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      basePrice: pricing.basePrice,
      deliveryFee: pricing.deliveryFee,
      totalPrice: pricing.totalPrice,
      platformFee: pricing.platformFee,
      mailerPayout: pricing.mailerPayout
    },
    include: {
      template: true
    }
  });

  logger.info(`Order updated: ${order.orderNumber}`);

  res.json({
    success: true,
    order: {
      id: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      status: updatedOrder.status,
      cardType: updatedOrder.cardType,
      message: updatedOrder.message,
      recipientName: updatedOrder.recipientName,
      deliveryAddress: updatedOrder.deliveryAddress,
      deliveryCity: updatedOrder.deliveryCity,
      deliveryState: updatedOrder.deliveryState,
      deliveryZip: updatedOrder.deliveryZip,
      deliveryType: updatedOrder.deliveryType,
      scheduledDate: updatedOrder.scheduledDate,
      totalPrice: updatedOrder.totalPrice,
      template: updatedOrder.template,
      customImageUrl: updatedOrder.customImageUrl
    }
  });
}));

/**
 * DELETE /api/orders/:id
 * Cancel order
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const order = await prisma.order.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found'
    });
  }

  if (!['PENDING', 'PAID'].includes(order.status)) {
    return res.status(400).json({
      success: false,
      error: 'Cannot cancel order',
      message: 'Order is already being processed'
    });
  }

  // If paid, would need to refund via Stripe
  // For now, just mark as cancelled
  const cancelledOrder = await prisma.order.update({
    where: { id },
    data: {
      status: 'CANCELLED'
    }
  });

  logger.info(`Order cancelled: ${order.orderNumber}`);

  res.json({
    success: true,
    message: 'Order cancelled successfully',
    order: {
      id: cancelledOrder.id,
      orderNumber: cancelledOrder.orderNumber,
      status: cancelledOrder.status
    }
  });
}));

export default router;
