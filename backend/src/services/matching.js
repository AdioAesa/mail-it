import { PrismaClient } from '@prisma/client';
import { calculateDistance, isWithinServiceArea } from './geocoding.js';
import logger from '../utils/logger.js';

const prisma = new PrismaClient();

/**
 * Get available jobs (paid orders without assigned mailers) within a mailer's radius
 * @param {number} mailerLat - Mailer's latitude
 * @param {number} mailerLng - Mailer's longitude
 * @param {number} radiusMiles - Mailer's service radius
 * @returns {Promise<Array>} Array of available jobs
 */
export async function getAvailableJobs(mailerLat, mailerLng, radiusMiles) {
  try {
    // Get all paid orders that haven't been assigned yet
    const availableOrders = await prisma.order.findMany({
      where: {
        status: 'PAID',
        mailerId: null,
        deliveryLat: { not: null },
        deliveryLng: { not: null }
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        template: {
          select: {
            name: true,
            imageUrl: true
          }
        }
      },
      orderBy: {
        paidAt: 'asc' // Oldest orders first
      }
    });

    // Filter orders within mailer's radius and calculate distance
    const jobsInRadius = availableOrders
      .map(order => {
        const distance = calculateDistance(
          mailerLat,
          mailerLng,
          order.deliveryLat,
          order.deliveryLng
        );

        return {
          id: order.id,
          orderNumber: order.orderNumber,
          cardType: order.cardType,
          message: order.message,
          recipientName: order.recipientName,
          recipientCity: order.deliveryCity,
          recipientState: order.deliveryState,
          deliveryType: order.deliveryType,
          scheduledDate: order.scheduledDate,
          distance,
          payout: order.mailerPayout,
          totalPrice: order.totalPrice,
          createdAt: order.createdAt,
          paidAt: order.paidAt,
          template: order.template
        };
      })
      .filter(job => job.distance <= radiusMiles)
      .sort((a, b) => {
        // Sort by delivery type priority (RUSH first), then by distance
        if (a.deliveryType === 'RUSH' && b.deliveryType !== 'RUSH') return -1;
        if (a.deliveryType !== 'RUSH' && b.deliveryType === 'RUSH') return 1;
        return a.distance - b.distance;
      });

    logger.info(`Found ${jobsInRadius.length} available jobs within ${radiusMiles} miles`);

    return jobsInRadius;
  } catch (error) {
    logger.error('Error getting available jobs:', error);
    throw error;
  }
}

/**
 * Get a mailer's active jobs (assigned but not yet delivered)
 * @param {string} mailerId - Mailer profile ID
 * @returns {Promise<Array>} Array of active jobs
 */
export async function getActiveJobs(mailerId) {
  try {
    const activeOrders = await prisma.order.findMany({
      where: {
        mailerId,
        status: {
          in: ['ASSIGNED', 'PRINTING', 'IN_TRANSIT']
        }
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            phoneNumber: true
          }
        },
        template: {
          select: {
            name: true,
            imageUrl: true
          }
        }
      },
      orderBy: {
        assignedAt: 'asc'
      }
    });

    const jobs = activeOrders.map(order => ({
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
      payout: order.mailerPayout,
      assignedAt: order.assignedAt,
      printedAt: order.printedAt,
      inTransitAt: order.inTransitAt,
      template: order.template,
      customImageUrl: order.customImageUrl,
      customer: {
        name: `${order.user.firstName} ${order.user.lastName}`,
        phone: order.user.phoneNumber
      }
    }));

    return jobs;
  } catch (error) {
    logger.error('Error getting active jobs:', error);
    throw error;
  }
}

/**
 * Assign a mailer to an order
 * @param {string} orderId - Order ID
 * @param {string} mailerId - Mailer profile ID
 * @returns {Promise<Object>} Updated order
 */
export async function assignMailerToJob(orderId, mailerId) {
  try {
    // Verify order is available
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        mailer: true
      }
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'PAID') {
      throw new Error('Order is not available for assignment');
    }

    if (order.mailerId) {
      throw new Error('Order has already been assigned to another mailer');
    }

    // Verify mailer exists and is active
    const mailer = await prisma.mailerProfile.findUnique({
      where: { id: mailerId }
    });

    if (!mailer) {
      throw new Error('Mailer not found');
    }

    if (!mailer.isActive) {
      throw new Error('Mailer is not active');
    }

    if (!mailer.stripeOnboarded) {
      throw new Error('Mailer has not completed Stripe onboarding');
    }

    // Check if delivery location is within mailer's service area
    if (order.deliveryLat && order.deliveryLng) {
      const isInArea = isWithinServiceArea(
        mailer.latitude,
        mailer.longitude,
        mailer.radiusMiles,
        order.deliveryLat,
        order.deliveryLng
      );

      if (!isInArea) {
        throw new Error('Delivery location is outside mailer\'s service area');
      }
    }

    // Assign mailer to order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        mailerId,
        status: 'ASSIGNED',
        assignedAt: new Date()
      },
      include: {
        mailer: {
          include: {
            user: true
          }
        },
        user: true,
        template: true
      }
    });

    logger.info(`Order ${order.orderNumber} assigned to mailer ${mailerId}`);

    return updatedOrder;
  } catch (error) {
    logger.error('Error assigning mailer to job:', error);
    throw error;
  }
}

/**
 * Get a mailer's earnings summary
 * @param {string} mailerId - Mailer profile ID
 * @returns {Promise<Object>} Earnings summary
 */
export async function getMailerEarnings(mailerId) {
  try {
    const completedOrders = await prisma.order.findMany({
      where: {
        mailerId,
        status: 'DELIVERED'
      },
      select: {
        mailerPayout: true,
        deliveredAt: true,
        orderNumber: true
      }
    });

    const totalEarnings = completedOrders.reduce(
      (sum, order) => sum + order.mailerPayout,
      0
    );

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const monthlyEarnings = completedOrders
      .filter(order => order.deliveredAt >= thisMonth)
      .reduce((sum, order) => sum + order.mailerPayout, 0);

    return {
      totalEarnings: parseFloat(totalEarnings.toFixed(2)),
      monthlyEarnings: parseFloat(monthlyEarnings.toFixed(2)),
      totalDeliveries: completedOrders.length,
      monthlyDeliveries: completedOrders.filter(order => order.deliveredAt >= thisMonth).length
    };
  } catch (error) {
    logger.error('Error getting mailer earnings:', error);
    throw error;
  }
}
