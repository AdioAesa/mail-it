import { Link, useLocation } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import Button from '../ui/Button'

const Navbar = () => {
  const location = useLocation()
  const isMailerRoute = location.pathname.startsWith('/mailer')

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              MailIt
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {!isMailerRoute && (
              <>
                <Link
                  to="/create"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Send a Card
                </Link>
                <SignedIn>
                  <Link
                    to="/orders"
                    className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                  >
                    My Orders
                  </Link>
                </SignedIn>
                <Link
                  to="/mailer/register"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Become a Mailer
                </Link>
              </>
            )}

            {isMailerRoute && (
              <>
                <Link
                  to="/mailer"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
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
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>

          {/* Mobile Menu Button & Auth */}
          <div className="md:hidden flex items-center space-x-2">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
