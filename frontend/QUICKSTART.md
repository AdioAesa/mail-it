# NearRun Frontend - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Install Dependencies
```bash
cd /home/ahdemirci/nearrun/frontend
npm install
```

### Step 2: Set Up Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your keys:
# - VITE_CLERK_PUBLISHABLE_KEY (get from https://clerk.com)
# - VITE_API_BASE_URL (default: http://localhost:5000/api)
# - VITE_STRIPE_PUBLISHABLE_KEY (get from https://stripe.com)
```

### Step 3: Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` - you're done!

## 📱 What You'll See

### Customer Flow
1. **Home Page** - Value proposition and how it works
2. **Create Card** - 5-step wizard:
   - Choose card type (Birthday, Christmas, Thank You, etc.)
   - Select template or upload custom design
   - Write your message
   - Enter recipient details
   - Review and proceed to checkout
3. **Checkout** - Select delivery type and pay
4. **Orders** - Track all your orders
5. **Order Detail** - See status timeline and delivery proof

### Mailer Flow
1. **Register as Mailer** - Set delivery radius and availability
2. **Dashboard** - View available jobs and earnings
3. **Accept Job** - Choose jobs in your area
4. **Update Status** - Mark as printing → in transit → delivered
5. **Upload Proof** - Add delivery photo to complete job

## 🎨 Design Features

### Mobile-First
- Bottom navigation on mobile
- Responsive grid layouts
- Touch-friendly buttons
- Optimized for 375px width

### Color Scheme
- Primary: Blue (#3B82F6)
- Accent: Purple (#8B5CF6)
- Clean, modern aesthetic

### Components
All custom-built with Tailwind CSS:
- Buttons (5 variants)
- Cards with shadows
- Forms with validation
- Modals
- Badges
- Loading states
- Empty states

## 🔐 Authentication

Uses Clerk for auth:
- Click "Sign In" button
- Create account or sign in
- Protected routes automatically redirect
- User profile in top right

## 📊 Mock Data

The app includes mock data for demo purposes:
- 10 card templates (Birthday, Christmas, Thank You, etc.)
- Sample orders
- Sample mailer jobs
- Earnings data

All API calls fall back to mock data if backend is unavailable.

## 🛠 Development Tips

### Hot Reload
Changes to code automatically refresh the browser.

### Tailwind Classes
Use Tailwind's utility classes. Custom theme in `tailwind.config.js`.

### Component Structure
```
src/components/
  ui/           - Base components (Button, Card, Input)
  cards/        - Card-specific features
  orders/       - Order tracking components
  mailer/       - Mailer-specific features
  layout/       - Navigation and layout
```

### Add New Page
1. Create in `src/pages/NewPage.jsx`
2. Add route in `src/App.jsx`
3. Add navigation link in `src/components/layout/Navbar.jsx` or `BottomNav.jsx`

### State Management
Order creation uses Zustand store in `src/store/orderStore.js`:
```jsx
import useOrderStore from '../store/orderStore'

const { cardType, setCardType } = useOrderStore()
```

## 🔌 Backend Integration

API service configured in `src/services/api.js`:
```javascript
import { ordersAPI, jobsAPI, mailersAPI } from '../services/api'

// Create order
const response = await ordersAPI.create(orderData)

// Get jobs
const jobs = await jobsAPI.getAvailable()
```

## 📦 Build for Production

```bash
# Create optimized build
npm run build

# Preview production build
npm run preview
```

Build output goes to `dist/` folder.

## 🎯 Next Steps

### Connect Real Backend
1. Update `VITE_API_BASE_URL` in `.env`
2. Ensure backend endpoints match API service
3. Test all flows end-to-end

### Add Stripe Payment
1. Install `@stripe/stripe-js` and `@stripe/react-stripe-js`
2. Add Stripe Elements to Checkout page
3. Handle payment confirmation

### Deploy
1. Build: `npm run build`
2. Deploy `dist/` folder to:
   - Vercel (recommended for Vite)
   - Netlify
   - AWS S3 + CloudFront
   - Your hosting provider

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Vite will try port 3001, 3002, etc. automatically
# Or specify a different port:
npm run dev -- --port 3001
```

### Clerk Not Loading
- Check `VITE_CLERK_PUBLISHABLE_KEY` in `.env`
- Ensure key starts with `pk_test_` or `pk_live_`
- Restart dev server after changing `.env`

### Styles Not Loading
```bash
# Rebuild Tailwind
npm run build
```

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 Resources

- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [React Router Docs](https://reactrouter.com)
- [Clerk Docs](https://clerk.com/docs)
- [Zustand Docs](https://zustand-demo.pmnd.rs)

## 💡 Pro Tips

1. **Use Browser DevTools** - React DevTools extension helps debug
2. **Check Console** - Errors and warnings show in browser console
3. **Mobile Testing** - Use browser's device emulation (F12 → Toggle Device Toolbar)
4. **Tailwind Intellisense** - Install VS Code extension for autocomplete
5. **Component Reuse** - All UI components are in `src/components/ui/`

Happy coding!
