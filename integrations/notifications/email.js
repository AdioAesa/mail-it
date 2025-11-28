/**
 * Email Notifications
 * Send transactional emails using Resend
 */

const { Resend } = require('resend');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config');
const constants = require('../config/constants');

let resend;
const templateCache = {};

/**
 * Initialize Resend client
 */
function initialize() {
  if (!resend && !config.mockMode) {
    resend = new Resend(config.email.apiKey);
    console.log('Email service initialized');
  }
}

/**
 * Load and cache email template
 * @param {string} templateName - Template file name without extension
 * @returns {Promise<string>} Template HTML
 */
async function loadTemplate(templateName) {
  if (templateCache[templateName]) {
    return templateCache[templateName];
  }

  const templatePath = path.join(__dirname, 'templates', `${templateName}.html`);

  try {
    const html = await fs.readFile(templatePath, 'utf8');
    templateCache[templateName] = html;
    return html;
  } catch (error) {
    console.error(`Error loading template ${templateName}:`, error.message);
    throw new Error(`Failed to load email template: ${templateName}`);
  }
}

/**
 * Simple template variable replacement
 * Supports {{variable}} and {{#conditional}}...{{/conditional}}
 * @param {string} template - HTML template
 * @param {Object} data - Data to replace
 * @returns {string} Rendered HTML
 */
function renderTemplate(template, data) {
  let html = template;

  // Handle conditionals {{#variable}}...{{/variable}}
  html = html.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match, key, content) => {
    return data[key] ? content : '';
  });

  // Handle simple variables {{variable}}
  html = html.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? data[key] : '';
  });

  return html;
}

/**
 * Send email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Send result
 */
async function sendEmail(to, subject, html, options = {}) {
  console.log(`Sending email to ${to}: ${subject}`);

  if (config.mockMode) {
    console.log('Mock email sent:', { to, subject });
    return {
      id: `mock_${Date.now()}`,
      to,
      subject,
      from: config.email.from
    };
  }

  initialize();

  try {
    const emailData = {
      from: options.from || config.email.from,
      to,
      subject,
      html,
      reply_to: options.replyTo || config.email.replyTo,
      ...options
    };

    const result = await resend.emails.send(emailData);

    console.log(`Email sent successfully: ${result.id}`);
    return result;
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

/**
 * Send order confirmation email
 * @param {string} email - Customer email
 * @param {Object} order - Order object
 * @returns {Promise<Object>} Send result
 */
async function sendOrderConfirmation(email, order) {
  const template = await loadTemplate('order-confirmation');

  const data = {
    customerName: order.customerName || 'Customer',
    orderNumber: order.orderNumber,
    cardType: order.cardType,
    message: order.message,
    recipientName: order.recipientName,
    deliveryAddress: order.deliveryAddress,
    deliveryType: order.deliveryType,
    scheduledDate: order.scheduledDate,
    cardPrice: (order.cardPrice / 100).toFixed(2),
    deliveryFee: order.deliveryFee ? (order.deliveryFee / 100).toFixed(2) : null,
    totalAmount: (order.totalAmount / 100).toFixed(2),
    trackingUrl: `${process.env.APP_URL || 'https://mailit.app'}/orders/${order.id}`
  };

  const html = renderTemplate(template, data);

  return await sendEmail(
    email,
    `Order Confirmation - ${order.orderNumber}`,
    html
  );
}

/**
 * Send order paid confirmation email
 * @param {string} email - Customer email
 * @param {Object} order - Order object
 * @returns {Promise<Object>} Send result
 */
async function sendOrderPaidConfirmation(email, order) {
  // For now, use the same template as order confirmation
  // Can create a separate template later if needed
  return await sendOrderConfirmation(email, order);
}

/**
 * Send mailer assigned notification
 * @param {string} email - Customer email
 * @param {Object} order - Order object
 * @param {Object} mailer - Mailer object
 * @returns {Promise<Object>} Send result
 */
async function sendMailerAssigned(email, order, mailer) {
  const subject = `Your order is on the way! - ${order.orderNumber}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #4CAF50;">Your Mailer is Ready!</h2>
      <p>Hi ${order.customerName || 'Customer'},</p>
      <p>Great news! Your ${order.cardType} card has been assigned to ${mailer.name}, who will hand-deliver it soon.</p>
      <p><strong>Order:</strong> ${order.orderNumber}<br>
      <strong>Delivering to:</strong> ${order.recipientName}<br>
      <strong>Expected delivery:</strong> ${order.expectedDeliveryDate || 'Today'}</p>
      <p>You'll receive another email with photo proof once the card is delivered.</p>
      <p>Track your order: <a href="${process.env.APP_URL || 'https://mailit.app'}/orders/${order.id}">View Order Status</a></p>
      <p>Thank you for using MailIt! 💚</p>
    </div>
  `;

  return await sendEmail(email, subject, html);
}

/**
 * Send delivery confirmation email
 * @param {string} email - Customer email
 * @param {Object} order - Order object
 * @param {string} proofUrl - Delivery proof image URL
 * @param {Object} delivery - Delivery details
 * @returns {Promise<Object>} Send result
 */
async function sendDeliveryConfirmation(email, order, proofUrl, delivery = {}) {
  const template = await loadTemplate('delivery-confirmation');

  const deliveryDate = new Date(delivery.deliveredAt || Date.now());

  const data = {
    customerName: order.customerName || 'Customer',
    cardType: order.cardType,
    recipientName: order.recipientName,
    deliveryAddress: order.deliveryAddress,
    proofImageUrl: proofUrl,
    deliveryDate: deliveryDate.toLocaleDateString(),
    deliveryTime: deliveryDate.toLocaleTimeString(),
    mailerName: delivery.mailerName || 'Your mailer',
    deliveryNotes: delivery.notes,
    ratingUrl: `${process.env.APP_URL || 'https://mailit.app'}/orders/${order.id}/rate`
  };

  const html = renderTemplate(template, data);

  return await sendEmail(
    email,
    `Card Delivered! - ${order.orderNumber}`,
    html
  );
}

/**
 * Send new job alert to mailer
 * @param {string} email - Mailer email
 * @param {Object} job - Job object
 * @returns {Promise<Object>} Send result
 */
async function sendMailerNewJob(email, job) {
  const template = await loadTemplate('new-job-alert');

  const isRush = job.deliveryType === 'RUSH';
  const payoutAmount = (job.payoutAmount / 100).toFixed(2);

  const data = {
    mailerName: job.mailerName || 'Mailer',
    payoutAmount,
    cardType: job.cardType,
    deliveryType: job.deliveryType,
    scheduledDate: job.scheduledDate,
    isRush,
    rushDeadline: job.rushDeadline,
    deliveryNeighborhood: job.deliveryNeighborhood || 'Your area',
    distance: job.distance ? job.distance.toFixed(1) : 'Unknown',
    hasSpecialInstructions: !!job.specialInstructions,
    specialInstructions: job.specialInstructions,
    acceptJobUrl: `${process.env.APP_URL || 'https://mailit.app'}/mailer/jobs/${job.id}/accept`,
    expiresInMinutes: job.expiresInMinutes || 30,
    unsubscribeUrl: `${process.env.APP_URL || 'https://mailit.app'}/mailer/notifications/unsubscribe`
  };

  const html = renderTemplate(template, data);

  return await sendEmail(
    email,
    isRush ? '🚀 RUSH JOB: New Delivery Available Near You' : 'New Delivery Job Available Near You',
    html
  );
}

/**
 * Send welcome email to new mailer
 * @param {string} email - Mailer email
 * @param {Object} mailer - Mailer object
 * @returns {Promise<Object>} Send result
 */
async function sendMailerWelcome(email, mailer) {
  const subject = 'Welcome to MailIt! Start Earning Today';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2196F3;">Welcome to MailIt, ${mailer.name}! 🎉</h2>
      <p>You're all set to start earning money by delivering happiness!</p>

      <div style="background-color: #E3F2FD; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">How It Works:</h3>
        <ol>
          <li>Get notified when delivery jobs are available near you</li>
          <li>Accept jobs that fit your schedule</li>
          <li>Print the card at any local print shop</li>
          <li>Hand-deliver with a smile and take a photo</li>
          <li>Get paid instantly via Stripe Connect</li>
        </ol>
      </div>

      <p><strong>Your Service Area:</strong> ${mailer.serviceRadius || 10} miles from your location</p>
      <p><strong>Estimated Earnings:</strong> $${((config.pricing.basePrices.BIRTHDAY * 0.7) / 100).toFixed(2)} - $${((config.pricing.basePrices.CUSTOM * 0.7) / 100).toFixed(2)} per delivery</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.APP_URL || 'https://mailit.app'}/mailer/dashboard"
           style="display: inline-block; padding: 15px 30px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
          Go to Dashboard
        </a>
      </div>

      <p>Questions? We're here to help at support@mailit.app</p>
      <p>Happy delivering! 💚</p>
    </div>
  `;

  return await sendEmail(email, subject, html);
}

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} resetToken - Password reset token
 * @returns {Promise<Object>} Send result
 */
async function sendPasswordReset(email, resetToken) {
  const resetUrl = `${process.env.APP_URL || 'https://mailit.app'}/reset-password?token=${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>Reset Your Password</h2>
      <p>You requested to reset your password for your MailIt account.</p>
      <p>Click the button below to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}"
           style="display: inline-block; padding: 15px 30px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
          Reset Password
        </a>
      </div>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p style="font-size: 12px; color: #666; margin-top: 30px;">
        Or copy and paste this URL into your browser:<br>
        ${resetUrl}
      </p>
    </div>
  `;

  return await sendEmail(email, 'Reset Your MailIt Password', html);
}

module.exports = {
  initialize,
  sendEmail,
  sendOrderConfirmation,
  sendOrderPaidConfirmation,
  sendMailerAssigned,
  sendDeliveryConfirmation,
  sendMailerNewJob,
  sendMailerWelcome,
  sendPasswordReset,
  loadTemplate,
  renderTemplate
};
