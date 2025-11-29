# NearRun Database

Prisma ORM setup for NearRun - a gig-economy app for hand-delivered cards and letters.

## Tech Stack

- **ORM**: Prisma 5.22.0
- **Database**: PostgreSQL
- **Hosting**: Railway (or any PostgreSQL provider)

## Database Schema

### Core Models

- **User** - Platform users (senders, mailers, admins)
- **MailerProfile** - Extended profile for users who deliver cards
- **Order** - Card delivery orders
- **CardTemplate** - Pre-designed card templates
- **AddOn** - Optional add-ons (flowers, chocolates, etc.)
- **OrderAddOn** - Join table for order add-ons
- **LegacyLetter** - Scheduled future deliveries
- **Payout** - Mailer earnings and payouts

### Key Design Decisions

1. **Money in Cents**: All prices stored as integers (cents) to avoid floating point precision issues
2. **Clerk Integration**: Users have `clerkId` field that maps to Clerk's authentication system
3. **Geolocation**: Orders and mailer profiles have lat/lng for radius-based matching
4. **Soft Delete**: Not implemented - use `CANCELLED` status instead
5. **Timestamps**: All tables have `createdAt` and `updatedAt`
6. **Cascading Deletes**: MailerProfile and OrderAddOn cascade delete with parent records

## Setup Instructions

### 1. Install Dependencies

```bash
cd /home/ahdemirci/nearrun/database
npm install
```

### 2. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your database URL
# Example: DATABASE_URL="postgresql://user:password@localhost:5432/nearrun"
```

### 3. Run Migrations

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations to create database schema
npm run db:migrate

# Or push schema without migrations (for development)
npm run db:push
```

### 4. Seed the Database

```bash
npm run db:seed
```

This will create:
- 3 test users (sender, mailer, admin)
- 1 mailer profile in Austin, TX
- 12 card templates (2 each: Birthday, Christmas, Thank You, Sympathy, Congratulations, Custom)
- 5 add-ons (flowers, chocolates, gift cards, balloons, calligraphy)
- 5 test orders in different statuses
- 1 legacy letter
- 1 test payout

### 5. Open Prisma Studio (Optional)

```bash
npm run db:studio
```

This opens a visual database browser at http://localhost:5555

## Available Scripts

```bash
npm run db:migrate        # Create and apply new migration
npm run db:migrate:deploy # Apply migrations in production
npm run db:generate       # Generate Prisma Client
npm run db:seed           # Seed database with test data
npm run db:studio         # Open Prisma Studio
npm run db:push           # Push schema changes without migrations
npm run db:reset          # Reset database and re-run migrations + seed
npm run db:setup          # Full setup: generate + migrate + seed
```

## Using Prisma Client

### In Node.js

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Query users
const users = await prisma.user.findMany();

// Create an order
const order = await prisma.order.create({
  data: {
    orderNumber: 'ML123456',
    status: 'PENDING',
    senderId: userId,
    cardType: 'BIRTHDAY',
    message: 'Happy Birthday!',
    // ... other fields
  },
});

// Find nearby mailers
const nearbyMailers = await prisma.mailerProfile.findMany({
  where: {
    isActive: true,
    // Add geolocation filtering logic
  },
});
```

### In Next.js API Routes

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// app/api/orders/route.ts
import { prisma } from '@/lib/prisma';

export async function GET() {
  const orders = await prisma.order.findMany();
  return Response.json(orders);
}
```

## Seed Data Details

### Test Users

| Email | Role | Clerk ID | Password |
|-------|------|----------|----------|
| sender@example.com | SENDER | clerk_sender_test_123 | (via Clerk) |
| mailer@example.com | MAILER | clerk_mailer_test_456 | (via Clerk) |
| admin@example.com | ADMIN | clerk_admin_test_789 | (via Clerk) |

### Mailer Profile

- **Location**: Austin, TX (30.2672, -97.7431)
- **Radius**: 15 miles
- **Status**: Active and verified
- **Rating**: 4.8 stars (25 ratings)
- **Completed Jobs**: 20
- **Stripe**: Connected (acct_test_mailer_123)

### Card Templates

12 templates across 6 categories:
- Birthday (2)
- Christmas (2)
- Thank You (2)
- Sympathy (2)
- Congratulations (2)
- Custom (2)

Prices range from $6.00 to $8.00

### Add-Ons

- Local Flowers ($15.00)
- Box of Chocolates ($12.00)
- Gift Card ($25.00)
- Balloon Bouquet ($10.00)
- Calligraphy Writing ($5.00)

### Test Orders

5 orders demonstrating the complete workflow:

1. **PENDING** - Birthday card, not yet paid
2. **PAID** - Thank you card with chocolates, awaiting assignment
3. **ASSIGNED** - Congratulations card with flowers, rush delivery
4. **IN_TRANSIT** - Sympathy card, currently being delivered
5. **DELIVERED** - Christmas card with gift card, 5-star rated

## Database Migrations

### Creating a New Migration

```bash
# Make changes to schema.prisma, then:
npm run db:migrate

# This will:
# 1. Prompt you for a migration name
# 2. Create SQL migration files in prisma/migrations/
# 3. Apply the migration to your database
# 4. Regenerate Prisma Client
```

### Production Deployment

```bash
# In production, use migrate deploy instead:
npm run db:migrate:deploy

# This applies pending migrations without prompting
```

## Railway Deployment

### 1. Create PostgreSQL Database

1. Go to [Railway](https://railway.app)
2. Create new project
3. Add PostgreSQL service
4. Copy the `DATABASE_URL` from the Connect tab

### 2. Update Environment

```bash
# In Railway project settings, add:
DATABASE_URL=postgresql://postgres:password@containers-us-west-123.railway.app:5432/railway
```

### 3. Deploy

```bash
# Push schema to Railway database
DATABASE_URL="your-railway-url" npm run db:migrate:deploy

# Seed the database
DATABASE_URL="your-railway-url" npm run db:seed
```

## Common Queries

### Find Orders by Status

```javascript
const pendingOrders = await prisma.order.findMany({
  where: { status: 'PENDING' },
  include: {
    sender: true,
    cardTemplate: true,
    addOns: {
      include: {
        addOn: true,
      },
    },
  },
});
```

### Find Nearby Mailers

```javascript
// Note: For production, use PostGIS or a proper geospatial query
// This is a simplified example
const mailers = await prisma.mailerProfile.findMany({
  where: {
    isActive: true,
    isVerified: true,
  },
  include: {
    user: true,
  },
});

// Filter by distance in application code
const nearbyMailers = mailers.filter(mailer => {
  const distance = calculateDistance(
    orderLat, orderLng,
    mailer.latitude, mailer.longitude
  );
  return distance <= mailer.radiusMiles;
});
```

### Get Mailer Earnings

```javascript
const mailerStats = await prisma.order.aggregate({
  where: {
    mailerId: mailerProfileId,
    status: 'DELIVERED',
  },
  _sum: {
    mailerPayoutCents: true,
  },
  _count: true,
});

console.log(`Earned: $${mailerStats._sum.mailerPayoutCents / 100}`);
console.log(`Jobs completed: ${mailerStats._count}`);
```

## Troubleshooting

### Migration Issues

```bash
# Reset database and start fresh
npm run db:reset

# This will:
# 1. Drop the database
# 2. Create it again
# 3. Apply all migrations
# 4. Run seed script
```

### Prisma Client Not Found

```bash
# Regenerate the client
npm run db:generate
```

### Connection Issues

```bash
# Test database connection
npx prisma db pull

# This will show any connection errors
```

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Railway Documentation](https://docs.railway.app)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Support

For issues with the database layer, check:
1. Environment variables are set correctly
2. Database is accessible
3. Migrations are applied
4. Prisma Client is generated

Run `npm run db:studio` to visually inspect your data.
