# Schema Mapping Guide

This document maps the differences between the existing database schema and the backend API code.

## Key Differences

### User Model

**Schema Fields:**
- `clerkId` - Clerk user ID
- `email` - User email
- `firstName` - First name
- `lastName` - Last name
- `phone` - Phone number (not `phoneNumber`)
- `role` - SENDER, MAILER, or ADMIN (enum)

**API Usage:**
- Use `phone` instead of `phoneNumber`
- User role is managed via enum, not separate flags

### Order Model

**Schema Fields:**
- `senderId` - User who created order (not `userId`)
- `cardTemplateId` - Template reference (not `templateId`)
- `basePriceCents` - Price in cents (not `basePrice` in dollars)
- `deliveryFeeCents` - Delivery fee in cents
- `totalPriceCents` - Total in cents
- `platformFeeCents` - Platform fee in cents
- `mailerPayoutCents` - Mailer payout in cents
- `latitude` / `longitude` - Delivery coordinates (not `deliveryLat`/`deliveryLng`)
- `stripePaymentIntentId` - Payment ID (not `stripePaymentId`)
- `stripePaidAt` - Payment timestamp (not `paidAt`)
- `isPaid` - Boolean flag
- `deliveryPhotoUrl` - Delivery proof (not `deliveryProofUrl`)

**Important:** All prices are stored in CENTS to avoid floating point precision issues.

### MailerProfile Model

**Schema Fields:**
- `completedJobs` - Number of completed jobs (not `totalDeliveries`)
- `rating` - Average rating (Float)
- `totalRatings` - Number of ratings
- `isVerified` - Verification status
- `assignedOrders` - Relation name for orders

### CardTemplate Model

**Schema Fields:**
- `category` - Uses CardType enum (not string)
- `basePriceCents` - Price in cents (default 700 = $7.00)
- `thumbnailUrl` - Optional thumbnail
- `sortOrder` - Display order

## Price Conversion

All prices in the database are stored in cents. The API must convert:

```javascript
// Database → API (cents to dollars)
const dollars = cents / 100;

// API → Database (dollars to cents)
const cents = Math.round(dollars * 100);
```

## CardType Enum Values

The schema supports these card types:
- BIRTHDAY
- CHRISTMAS
- THANK_YOU
- SYMPATHY
- CONGRATULATIONS
- ANNIVERSARY
- VALENTINES
- MOTHERS_DAY
- FATHERS_DAY
- GRADUATION
- CUSTOM

## OrderStatus Flow

```
PENDING → PAID → ASSIGNED → PRINTING → IN_TRANSIT → DELIVERED
                                    ↘ CANCELLED
                                    ↘ REFUNDED
```

## DeliveryType Enum

- STANDARD
- RUSH
- SCHEDULED

## Additional Models

The schema includes:

- **AddOn** - Optional add-ons for orders
- **OrderAddOn** - Many-to-many relation for order add-ons
- **LegacyLetter** - Future delivery scheduling feature
- **Payout** - Mailer payout tracking

## Required Backend Updates

1. Update all dollar amounts to use cents
2. Change `userId` to `senderId` in order creation
3. Change `templateId` to `cardTemplateId`
4. Update coordinate field names
5. Update payment field names
6. Update phone field name
7. Handle CardType as enum
8. Support additional card types
