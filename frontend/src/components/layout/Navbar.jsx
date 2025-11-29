import { Link, useLocation } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import Button from '../ui/Button'

const Navbar = () => {
  const location = useLocation()
  const isMailerRoute = location.pathname.startsWith('/mailer')

  return (
    <nav className="bg-paper-white/95 backdrop-blur-md border-b border-paper-kraft/30 sticky top-0 z-40 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            {/* Wax seal logo */}
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-gradient-to-br from-burgundy-500 via-burgundy-600 to-burgundy-700 rounded-full shadow-wax">
                {/* Highlight */}
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/20 to-transparent" style={{ clipPath: 'ellipse(60% 40% at 30% 30%)' }} />
              </div>
              <span className="absolute inset-0 flex items-center justify-center font-serif font-bold text-cream-50 text-lg">
                M
              </span>
            </div>
            <span className="text-2xl font-serif font-bold text-ink-black group-hover:text-burgundy-700 transition-colors">
              NearRun
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {!isMailerRoute && (
              <>
                <Link
                  to="/create"
                  className="text-ink-medium hover:text-burgundy-600 font-medium transition-colors ink-underline"
                >
                  Send a Card
                </Link>
                <SignedIn>
                  <Link
                    to="/orders"
                    className="text-ink-medium hover:text-burgundy-600 font-medium transition-colors ink-underline"
                  >
                    My Orders
                  </Link>
                </SignedIn>
                <Link
                  to="/mailer/register"
                  className="text-ink-medium hover:text-burgundy-600 font-medium transition-colors ink-underline"
                >
                  Become a Mailer
                </Link>
              </>
            )}

            {isMailerRoute && (
              <>
                <Link
                  to="/mailer"
                  className="text-ink-medium hover:text-burgundy-600 font-medium transition-colors ink-underline"
                >
                  Dashboard
                </Link>
                <Link
                  to="/"
                  className="text-ink-medium hover:text-burgundy-600 font-medium transition-colors ink-underline"
                >
                  Customer Portal
                </Link>
              </>
            )}

            {/* Auth Buttons */}
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'w-9 h-9 ring-2 ring-paper-kraft/30 ring-offset-2 ring-offset-paper-white'
                  }
                }}
              />
            </SignedIn>
          </div>

          {/* Mobile Menu Button & Auth */}
          <div className="md:hidden flex items-center space-x-3">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'w-9 h-9 ring-2 ring-paper-kraft/30'
                  }
                }}
              />
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
