# Database Schema Overview

## Entity Relationship Diagram (Text)

```
┌─────────────────┐
│      User       │
├─────────────────┤
│ id (PK)         │
│ clerkId (UK)    │─────┐
│ email (UK)      │     │
│ firstName       │     │
│ lastName        │     │
│ phone           │     │
│ role            │     │
└─────────────────┘     │
         │              │
         │ 1            │ 1
         │              │
         │              │
         │ *            │ 1
┌────────▼────────┐    │
│     Order       │    │
├─────────────────┤    │
│ id (PK)         │    │
│ orderNumber(UK) │    │
│ status          │    │
│ senderId (FK)───┘    │
│ mailerId (FK)───┐    │
│ cardTemplateId  │    │
│ message         │    │
│ deliveryAddress │    │
│ latitude/lng    │    │
│ *PriceCents     │    │
│ isPaid          │    │
│ deliveredAt     │    │
└─────────────────┘    │
         │             │
         │ *           │
         │             │
┌────────▼────────┐    │
│  OrderAddOn     │    │
├─────────────────┤    │
│ id (PK)         │    │
│ orderId (FK)    │    │
│ addOnId (FK)────┼───┐│
│ priceCents      │   ││
└─────────────────┘   ││
                      ││
┌─────────────────┐   ││
│ MailerProfile   │◄──┘│
├─────────────────┤    │
│ id (PK)         │    │
│ userId (FK) ────┼────┘
│ latitude/lng    │
│ address         │
│ radiusMiles     │
│ isActive        │
│ rating          │
│ stripeAccountId │
└─────────────────┘

┌─────────────────┐   ┌─────────────────┐
│ CardTemplate    │   │     AddOn       │
├─────────────────┤   ├─────────────────┤
│ id (PK)         │   │ id (PK)         │
│ name            │   │ name            │
│ category        │   │ description     │
│ imageUrl        │   │ priceCents      │
│ basePriceCents  │   │ isActive        │
└─────────────────┘   └─────────────────┘
         ▲                     ▲
         │                     │
         └─────────┬───────────┘
                   │
           (Referenced by Order
            and OrderAddOn)

┌─────────────────┐   ┌─────────────────┐
│ LegacyLetter    │   │     Payout      │
├─────────────────┤   ├─────────────────┤
│ id (PK)         │   │ id (PK)         │
│ userId          │   │ mailerId        │
│ recipientName   │   │ amountCents     │
│ message         │   │ stripeTransferId│
│ deliverOn       │   │ status          │
│ isDelivered     │   │ paidAt          │
└─────────────────┘   └─────────────────┘
```

## Table Relationships

### User → Order (1:Many)
- A user can create many orders as a sender
- `Order.senderId` → `User.id`

### User → MailerProfile (1:1)
- A user can have one mailer profile
- `MailerProfile.userId` → `User.id`
- Cascade delete: If user is deleted, mailer profile is deleted

### MailerProfile → Order (1:Many)
- A mailer can be assigned to many orders
- `Order.mailerId` → `MailerProfile.id`

### CardTemplate → Order (1:Many)
- A template can be used in many orders
- `Order.cardTemplateId` → `CardTemplate.id`

### Order → OrderAddOn (1:Many)
- An order can have multiple add-ons
- `OrderAddOn.orderId` → `Order.id`
- Cascade delete: If order is deleted, add-ons are deleted

### AddOn → OrderAddOn (1:Many)
- An add-on can appear in many orders
- `OrderAddOn.addOnId` → `AddOn.id`

## Enums

### Role
- `SENDER` - Can create orders
- `MAILER` - Can deliver orders
- `ADMIN` - Platform administrator

### OrderStatus
- `PENDING` - Created but not paid
- `PAID` - Payment received, awaiting mailer assignment
- `ASSIGNED` - Mailer accepted the job
- `PRINTING` - Card is being printed
- `IN_TRANSIT` - Mailer is delivering
- `DELIVERED` - Successfully delivered
- `CANCELLED` - Order was cancelled
- `REFUNDED` - Payment was refunded

### CardType
- `BIRTHDAY`
- `CHRISTMAS`
- `THANK_YOU`
- `SYMPATHY`
- `CONGRATULATIONS`
- `ANNIVERSARY`
- `VALENTINES`
- `MOTHERS_DAY`
- `FATHERS_DAY`
- `GRADUATION`
- `CUSTOM`

### DeliveryType
- `STANDARD` - Normal delivery
- `RUSH` - Expedited delivery (higher fee)
- `SCHEDULED` - Deliver on specific date

### PayoutStatus
- `PENDING` - Awaiting processing
- `PROCESSING` - In progress
- `PAID` - Successfully paid
- `FAILED` - Payment failed

## Key Indexes

Performance-optimized queries:

### MailerProfile
- `[latitude, longitude]` - Geolocation queries
- `[isActive]` - Finding available mailers

### Order
- `[senderId]` - User's orders
- `[mailerId]` - Mailer's assignments
- `[status]` - Orders by status
- `[latitude, longitude]` - Location-based matching
- `[createdAt]` - Recent orders

### CardTemplate
- `[category]` - Templates by type
- `[isActive]` - Active templates only

### LegacyLetter
- `[deliverOn]` - Upcoming deliveries
- `[userId]` - User's scheduled letters

## Money Fields (All in Cents)

To avoid floating-point precision issues, all money is stored as integers:

### Order Pricing
- `basePriceCents` - Card template price
- `deliveryFeeCents` - Delivery fee
- `addOnsTotalCents` - Sum of add-on prices
- `totalPriceCents` - Total customer pays
- `platformFeeCents` - NearRun's cut
- `mailerPayoutCents` - Mailer receives

Example:
```javascript
// $7.00 card + $3.00 delivery + $12.00 chocolates = $22.00
{
  basePriceCents: 700,
  deliveryFeeCents: 300,
  addOnsTotalCents: 1200,
  totalPriceCents: 2200,
  platformFeeCents: 330,      // 15% platform fee
  mailerPayoutCents: 1870     // Mailer gets $18.70
}
```

## Location-Based Matching

### MailerProfile Fields
- `latitude` - Mailer's base location
- `longitude` - Mailer's base location
- `radiusMiles` - How far mailer will travel

### Order Fields
- `latitude` - Delivery location
- `longitude` - Delivery location

### Matching Logic (Example)
```javascript
// Find mailers within range of delivery address
const distance = calculateHaversineDistance(
  orderLat, orderLng,
  mailerLat, mailerLng
);

if (distance <= mailer.radiusMiles && mailer.isActive) {
  // Mailer can deliver this order
}
```

## Clerk Integration

### User.clerkId
- Maps to Clerk's user ID
- Unique constraint ensures one-to-one mapping
- Used for authentication and user session management

Example flow:
```javascript
// User signs in with Clerk
const { userId } = auth();

// Find or create user in database
const user = await prisma.user.findUnique({
  where: { clerkId: userId }
});
```

## Timestamps

All tables include:
- `createdAt` - Record creation time (auto-set)
- `updatedAt` - Last modification time (auto-updated)

These are managed automatically by Prisma.

## Unique Constraints

- `User.clerkId` - One Clerk user = One database user
- `User.email` - Email must be unique
- `Order.orderNumber` - Order number must be unique
- `MailerProfile.userId` - One user can have only one mailer profile
- `OrderAddOn[orderId, addOnId]` - Can't add same add-on twice to one order
