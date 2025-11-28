import { useNavigate } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react'
import Button from '../components/ui/Button'

const Home = () => {
  const navigate = useNavigate()

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-accent-50 pt-12 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 text-balance">
            Your heartfelt message,{' '}
            <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              hand-delivered
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto text-balance">
            Send personalized cards and letters delivered by local mailers. Because some
            messages deserve more than a text.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/create')}
            >
              Send a Card
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/mailer/register')}
            >
              Become a Mailer
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-2xl mx-auto">
            <div>
              <p className="text-3xl font-bold text-primary-600">$7</p>
              <p className="text-sm text-gray-600 mt-1">Standard Delivery</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-600">24-48h</p>
              <p className="text-sm text-gray-600 mt-1">Delivery Time</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-600">100%</p>
              <p className="text-sm text-gray-600 mt-1">Hand Delivered</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✏️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Create Your Card</h3>
              <p className="text-gray-600">
                Choose from beautiful templates or upload your own design. Write your
                heartfelt message.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💳</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Pay & Confirm</h3>
              <p className="text-gray-600">
                Enter the recipient's address and choose standard ($7) or rush ($15)
                delivery.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚶</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Hand-Delivered</h3>
              <p className="text-gray-600">
                A local mailer prints and hand-delivers your card with photo proof of
                delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose MailIt?</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-primary-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Personal Touch</h3>
                <p className="text-gray-600">
                  Real people, real delivery. Not a machine - a neighbor who cares.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-accent-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Fast Delivery</h3>
                <p className="text-gray-600">
                  Standard delivery in 24-48 hours. Need it faster? Choose rush delivery.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-primary-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Proof of Delivery</h3>
                <p className="text-gray-600">
                  Get photo confirmation when your card arrives safely.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-accent-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Affordable</h3>
                <p className="text-gray-600">
                  Just $7 for standard delivery. No hidden fees or subscriptions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Send a Card?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of people making meaningful connections through handwritten
            cards.
          </p>

          <SignedOut>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <SignInButton mode="modal">
                <Button variant="primary" size="lg">
                  Get Started
                </Button>
              </SignInButton>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/create')}
              >
                Browse Templates
              </Button>
            </div>
          </SignedOut>

          <SignedIn>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/create')}
            >
              Create Your Card
            </Button>
          </SignedIn>
        </div>
      </section>
    </div>
  )
}

export default Home
