# NearRun Frontend

A modern React application for NearRun - a gig-economy platform for hand-delivered cards and letters.

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **Clerk** - Authentication and user management
- **Zustand** - State management
- **Axios** - HTTP client

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   │   ├── cards/       # Card-related components
│   │   ├── layout/      # Layout components (Navbar, BottomNav)
│   │   ├── mailer/      # Mailer-specific components
│   │   ├── orders/      # Order-related components
│   │   └── ui/          # Base UI components (Button, Card, Input, etc.)
│   ├── data/            # Mock data and constants
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── store/           # State management (Zustand)
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles
├── index.html           # HTML entry point
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind configuration
└── vite.config.js       # Vite configuration
```

## Pages

### Customer Pages
- **Home (`/`)** - Landing page with value proposition and how it works
- **Create Card (`/create`)** - Multi-step wizard for creating cards
- **Checkout (`/checkout`)** - Payment and order confirmation
- **Orders (`/orders`)** - List of user's orders
- **Order Detail (`/orders/:id`)** - Detailed order view with status tracking

### Mailer Pages
- **Mailer Register (`/mailer/register`)** - Mailer registration form
- **Mailer Dashboard (`/mailer`)** - Available jobs and earnings
- **Job Detail (`/mailer/jobs/:id`)** - Job details and status updates

## Features

### Customer Features
- Browse and select card templates
- Upload custom card designs
- Write personalized messages
- Enter recipient details
- Choose delivery speed (Standard $7 / Rush $15)
- Track order status in real-time
- View delivery proof photos
- Cancel pending orders

### Mailer Features
- Register as a mailer with delivery preferences
- Browse available jobs in local area
- Accept delivery jobs
- Update job status (Printing → In Transit → Delivered)
- Upload delivery proof photos
- Track earnings

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Add your environment variables to `.env`:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
VITE_API_BASE_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

### Development

Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## UI Components

All components are built from scratch using Tailwind CSS (no external UI library):

### Base Components (`src/components/ui/`)
- **Button** - Multiple variants (primary, secondary, outline, ghost, danger)
- **Card** - Reusable container with shadow and padding
- **Input** - Form input with label and error handling
- **Select** - Dropdown select with label
- **Modal** - Dialog/modal component
- **Badge** - Status indicator badges
- **Spinner** - Loading spinner

### Feature Components
- **TemplateGallery** - Grid of card templates
- **CardPreview** - Preview card with message
- **OrderCard** - Order summary card
- **StatusTimeline** - Visual order status tracker
- **JobCard** - Job listing for mailers
- **DeliveryProof** - Photo upload component

## Responsive Design

The app follows a mobile-first approach:
- Mobile: Bottom navigation, single column layouts
- Desktop: Top navigation, multi-column layouts
- Breakpoints: Tailwind default (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)

## Authentication

Uses Clerk for authentication:
- Sign in/sign up modals
- Protected routes
- User profile management
- Session management

## State Management

Uses Zustand for order creation flow:
- Persists order data to localStorage
- Multi-step wizard state
- Easy state updates

## API Integration

API service layer in `src/services/api.js`:
- Axios instance with interceptors
- Automatic auth token injection
- Error handling
- Mock data fallbacks for demo

## Styling

Tailwind CSS with custom configuration:
- Custom color palette (primary blue, accent purple)
- Custom shadows and animations
- Mobile-first utilities
- Dark mode ready (if needed)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Proprietary - All rights reserved
