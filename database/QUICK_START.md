# NearRun Database - Quick Start

## Setup (First Time)

```bash
cd /home/ahdemirci/nearrun/database

# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env

# 3. Edit .env and add your PostgreSQL connection string
# DATABASE_URL="postgresql://user:password@localhost:5432/nearrun"

# 4. Generate Prisma Client
npm run db:generate

# 5. Run migrations (creates tables)
npm run db:migrate

# 6. Seed with test data
npm run db:seed

# 7. Open Prisma Studio to view data
npm run db:studio
```

## Railway Deployment

```bash
# In Railway dashboard:
# 1. Create new project
# 2. Add PostgreSQL service
# 3. Copy DATABASE_URL from Railway

# Then run:
DATABASE_URL="your-railway-url" npm run db:migrate:deploy
DATABASE_URL="your-railway-url" npm run db:seed
```

## Test Data Included

After seeding, you'll have:

### Users
- **sender@example.com** (SENDER role)
- **mailer@example.com** (MAILER role) - Has delivery profile in Austin, TX
- **admin@example.com** (ADMIN role)

### 12 Card Templates
- Birthday (2)
- Christmas (2)
- Thank You (2)
- Sympathy (2)
- Congratulations (2)
- Custom (2)

### 5 Add-Ons
- Local Flowers ($15)
- Box of Chocolates ($12)
- Gift Card ($25)
- Balloon Bouquet ($10)
- Calligraphy Writing ($5)

### 5 Sample Orders
- PENDING (not paid)
- PAID (awaiting assignment)
- ASSIGNED (mailer accepted)
- IN_TRANSIT (being delivered)
- DELIVERED (completed with 5-star rating)

## Common Commands

```bash
npm run db:studio          # Visual database browser
npm run db:migrate         # Create new migration
npm run db:generate        # Regenerate Prisma Client
npm run db:seed            # Re-seed database
npm run db:reset           # Reset everything and re-seed
```

## Using in Your App

```javascript
// Import Prisma Client
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Query examples
const orders = await prisma.order.findMany();
const users = await prisma.user.findUnique({ where: { email: 'sender@example.com' } });
```

## Database Schema Highlights

### Key Tables
- `users` - Platform users (senders, mailers, admins)
- `mailer_profiles` - Location and payout info for mailers
- `orders` - Card delivery orders
- `card_templates` - Pre-designed cards
- `add_ons` - Optional gifts (flowers, chocolates, etc.)
- `legacy_letters` - Future scheduled deliveries

### Important Fields
- All prices stored in **cents** (integer) to avoid rounding issues
- Orders have **lat/lng** for location-based mailer matching
- Users have **clerkId** for Clerk authentication integration
- All tables have **createdAt** and **updatedAt** timestamps

## Next Steps

1. Configure your PostgreSQL database (local or Railway)
2. Run the setup commands above
3. Open Prisma Studio to explore the data
4. Start building your API endpoints using Prisma Client

See `README.md` for detailed documentation.
