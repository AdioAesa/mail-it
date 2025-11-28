import { clerkClient, requireAuth } from '@clerk/express';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';

const prisma = new PrismaClient();

/**
 * Middleware to verify Clerk JWT token and attach user to request
 * Requires the request to be authenticated via Clerk
 */
export const authenticateUser = async (req, res, next) => {
  try {
    // Get the auth object from Clerk middleware
    const { userId } = req.auth;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No valid authentication token provided'
      });
    }

    // Find or create user in our database
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        mailerProfile: true
      }
    });

    // If user doesn't exist in our DB, create them
    if (!user) {
      // Fetch user details from Clerk
      const clerkUser = await clerkClient.users.getUser(userId);

      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          phoneNumber: clerkUser.phoneNumbers[0]?.phoneNumber
        },
        include: {
          mailerProfile: true
        }
      });

      logger.info(`New user created: ${user.id} (${user.email})`);
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({
      error: 'Authentication failed',
      message: error.message
    });
  }
};

/**
 * Middleware to verify user is a registered mailer
 */
export const requireMailer = async (req, res, next) => {
  try {
    if (!req.user?.mailerProfile) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You must be registered as a mailer to access this resource'
      });
    }

    next();
  } catch (error) {
    logger.error('Mailer verification error:', error);
    res.status(403).json({
      error: 'Forbidden',
      message: error.message
    });
  }
};
