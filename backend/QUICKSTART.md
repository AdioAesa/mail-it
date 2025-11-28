# MailIt Backend - Quick Start Guide

Get the backend API running in under 5 minutes!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- Clerk account (for auth)
- Stripe account (for payments)
- Cloudinary account (for image uploads)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd /home/ahdemirci/mailit/backend
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
PORT=3001
NODE_ENV=development

# Your PostgreSQL connection string
DATABASE_URL=postgresql://username:password@localhost:5432/mailit

# Get from Clerk Dashboard
CLERK_SECRET_KEY=sk_test_your_key_here
CLERK_PUBLISHABLE_KEY=pk_test_your_key_here

# Get from Stripe Dashboard
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here

# Get from Cloudinary Dashboard
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Your frontend URL
FRONTEND_URL=http://localhost:5173
```

### 3. Set Up Database

```bash
# Generate Prisma client
npm run prisma:generate

# Create database tables
npm run prisma:migrate

# Seed initial card templates
npm run seed:templates
```

### 4. Start the Server

```bash
npm run dev
```

You should see:

```
MailIt API server running on port 3001
Environment: development
Frontend URL: http://localhost:5173
```

### 5. Test the API

Open your browser or use curl:

```bash
# Health check
curl http://localhost:3001/api/health

# List templates
curl http://localhost:3001/api/templates
```

## Common Issues

### "Connection refused" error

- Make sure PostgreSQL is running
- Check your `DATABASE_URL` in `.env`

### "Authentication failed" error

- Verify your `CLERK_SECRET_KEY` is correct
- Make sure you're including the Bearer token in requests

### "Prisma client not found" error

```bash
npm run prisma:generate
```

## Next Steps

1. Configure Stripe webhooks to point to `/api/webhooks/stripe`
2. Update card template images in database
3. Test the complete order flow
4. Set up frontend to connect to this backend

## Testing with Postman

Import this example request:

```json
{
  "name": "MailIt API",
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "http://localhost:3001/api/health"
      }
    },
    {
      "name": "List Templates",
      "request": {
        "method": "GET",
        "url": "http://localhost:3001/api/templates"
      }
    },
    {
      "name": "Create Order",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{clerk_token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"cardType\": \"BIRTHDAY\",\n  \"message\": \"Happy Birthday!\",\n  \"recipientName\": \"John Doe\",\n  \"deliveryAddress\": \"123 Main St\",\n  \"deliveryCity\": \"Austin\",\n  \"deliveryState\": \"TX\",\n  \"deliveryZip\": \"78701\",\n  \"deliveryType\": \"STANDARD\"\n}"
        },
        "url": "http://localhost:3001/api/orders"
      }
    }
  ]
}
```

## Support

For issues or questions:

1. Check the logs: `combined.log` and `error.log`
2. Review the main README.md
3. Check Prisma Studio: `npm run prisma:studio`
