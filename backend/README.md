# NearRun Backend API

A complete Node.js + Express backend for NearRun - a gig-economy app for hand-delivered cards and letters.

## Tech Stack

- **Node.js** with Express
- **Prisma ORM** for database management
- **Clerk** for authentication
- **Stripe** for payments and payouts
- **Cloudinary** for image uploads
- **PostgreSQL** database

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `CLERK_SECRET_KEY` - Clerk secret key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `CLOUDINARY_URL` - Cloudinary URL
- `FRONTEND_URL` - Frontend URL for CORS

### 3. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view/edit data
npm run prisma:studio
```

### 4. Seed Initial Data

```bash
node scripts/seed.js
```

This will create initial card templates.

### 5. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## API Documentation

### Authentication

All routes except `/api/webhooks` and `/api/templates` require authentication via Clerk.

Include the Clerk session token in the `Authorization` header:

```
Authorization: Bearer <clerk-token>
```

### Endpoints

#### Orders

- `POST /api/orders` - Create new order
- `GET /api/orders` - List user's orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders/:id/pay` - Create Stripe payment intent
- `PUT /api/orders/:id` - Update order (before payment)
- `DELETE /api/orders/:id` - Cancel order

#### Mailer

- `POST /api/mailer/register` - Register as mailer
- `GET /api/mailer/profile` - Get mailer profile
- `PUT /api/mailer/profile` - Update mailer profile
- `GET /api/mailer/jobs` - Get available jobs in radius
- `GET /api/mailer/jobs/active` - Get mailer's active jobs
- `POST /api/mailer/jobs/:id/accept` - Accept a job
- `PUT /api/mailer/jobs/:id/status` - Update job status
- `POST /api/mailer/jobs/:id/complete` - Mark delivered with proof
- `GET /api/mailer/earnings` - Get earnings summary

#### Templates

- `GET /api/templates` - List all card templates
- `GET /api/templates/:id` - Get template details

#### Upload

- `POST /api/upload/card-image` - Upload custom card image
- `POST /api/upload/delivery-proof` - Upload delivery proof

#### Webhooks

- `POST /api/webhooks/stripe` - Stripe webhook handler

## Order Status Flow

```
PENDING → PAID → ASSIGNED → PRINTING → IN_TRANSIT → DELIVERED
                                    ↘ CANCELLED
```

## Pricing

### Base Prices

- Birthday: $7
- Christmas: $8
- Thank You: $6
- Custom: $10

### Delivery Fees

- Standard: $0
- Rush: $8
- Scheduled: $2

### Revenue Split

- Mailer: 70%
- Platform: 30%

## Stripe Integration

### Payment Flow

1. Customer creates order (status: PENDING)
2. Customer pays via Stripe (status: PAID)
3. Mailer accepts job (status: ASSIGNED)
4. Mailer prints card (status: PRINTING)
5. Mailer delivers card (status: IN_TRANSIT → DELIVERED)
6. Platform transfers 70% to mailer's Stripe Connect account

### Webhooks

Configure Stripe webhooks to point to `/api/webhooks/stripe`:

- `payment_intent.succeeded` - Mark order as paid
- `payment_intent.payment_failed` - Log payment failure
- `account.updated` - Update mailer onboarding status
- `transfer.created` - Log successful payout
- `transfer.failed` - Log failed payout

## Development

### File Structure

```
backend/
├── src/
│   ├── index.js              # Express app entry point
│   ├── routes/
│   │   ├── index.js          # Route aggregator
│   │   ├── orders.js         # Order endpoints
│   │   ├── mailer.js         # Mailer endpoints
│   │   ├── templates.js      # Template endpoints
│   │   ├── upload.js         # Upload endpoints
│   │   └── webhooks.js       # Webhook handlers
│   ├── middleware/
│   │   ├── auth.js           # Clerk authentication
│   │   ├── errorHandler.js   # Error handling
│   │   └── validate.js       # Request validation
│   ├── services/
│   │   ├── stripe.js         # Stripe operations
│   │   ├── geocoding.js      # Geocoding & distance
│   │   ├── matching.js       # Job matching
│   │   └── pricing.js        # Pricing calculations
│   └── utils/
│       ├── generateOrderNumber.js
│       └── logger.js
├── package.json
├── .env.example
└── README.md
```

### Logging

Logs are written to:

- `error.log` - Error level logs
- `combined.log` - All logs
- Console (in development)

### Testing

Test endpoints with curl or Postman:

```bash
# Health check
curl http://localhost:3001/api/health

# List templates (no auth required)
curl http://localhost:3001/api/templates

# Create order (auth required)
curl -X POST http://localhost:3001/api/orders \
  -H "Authorization: Bearer <clerk-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "cardType": "BIRTHDAY",
    "message": "Happy Birthday!",
    "recipientName": "John Doe",
    "deliveryAddress": "123 Main St",
    "deliveryCity": "Austin",
    "deliveryState": "TX",
    "deliveryZip": "78701",
    "deliveryType": "STANDARD"
  }'
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a process manager (PM2, systemd, etc.)
3. Set up SSL/TLS termination
4. Configure proper CORS origins
5. Set up log rotation
6. Configure Stripe webhooks for production
7. Use PostgreSQL with proper connection pooling

## License

Proprietary
