import { useNavigate } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react'
import Button from '../components/ui/Button'

// Decorative stamp component
const PostageStamp = ({ children, className = '' }) => (
  <div className={`stamp animate-stamp ${className}`}>
    <div className="bg-cream-50 p-3 flex flex-col items-center">
      {children}
    </div>
  </div>
)

// Wax seal component
const WaxSeal = ({ size = 'md', children }) => {
  const sizes = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  }
  return (
    <div className={`wax-seal ${sizes[size]}`}>
      <span className="relative z-10 font-serif font-bold text-cream-50">
        {children}
      </span>
    </div>
  )
}

// Decorative envelope illustration
const EnvelopeIllustration = () => (
  <div className="relative w-64 h-44 mx-auto animate-float">
    {/* Envelope body */}
    <div className="absolute inset-0 bg-cream-100 rounded-sm shadow-card border border-paper-kraft/50">
      {/* Inner shadow */}
      <div className="absolute inset-2 border border-paper-kraft/20 rounded-sm" />
    </div>

    {/* Envelope flap */}
    <div
      className="absolute -top-1 left-0 right-0 h-24 origin-bottom"
      style={{
        background: 'linear-gradient(180deg, #EDE0C0 0%, #FAF3E3 100%)',
        clipPath: 'polygon(0 100%, 50% 20%, 100% 100%)',
        borderBottom: '1px solid rgba(201, 184, 150, 0.4)',
      }}
    />

    {/* Stamp */}
    <div className="absolute -top-2 -right-2 w-14 h-16 bg-paper-white border-2 border-dashed border-paper-kraft/50 p-1 shadow-stamp rotate-3">
      <div className="w-full h-full bg-gradient-to-br from-burgundy-100 to-burgundy-200 flex items-center justify-center">
        <span className="text-burgundy-600 text-xs font-serif font-semibold">$7</span>
      </div>
    </div>

    {/* Wax seal */}
    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
      <WaxSeal size="sm">M</WaxSeal>
    </div>

    {/* Address lines */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/4 w-3/4 space-y-2">
      <div className="h-0.5 bg-ink-faded/30 rounded" />
      <div className="h-0.5 bg-ink-faded/30 rounded w-4/5" />
      <div className="h-0.5 bg-ink-faded/30 rounded w-3/5" />
    </div>
  </div>
)

const Home = () => {
  const navigate = useNavigate()

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background with postal stripes */}
        <div className="absolute inset-0 aged-paper-gradient postal-stripes" />

        {/* Paper texture overlay */}
        <div className="absolute inset-0 paper-texture" />

        {/* Decorative corner flourishes */}
        <div className="absolute top-8 left-8 w-24 h-24 border-l-2 border-t-2 border-paper-kraft/40 rounded-tl-lg hidden md:block" />
        <div className="absolute top-8 right-8 w-24 h-24 border-r-2 border-t-2 border-paper-kraft/40 rounded-tr-lg hidden md:block" />

        <div className="relative pt-16 pb-24 px-4">
          <div className="max-w-5xl mx-auto">
            {/* Script accent */}
            <p className="text-center font-script text-2xl text-burgundy-500 mb-4 animate-slide-up">
              Because some messages deserve more than a text
            </p>

            {/* Main headline */}
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-ink-black text-center mb-6 animate-slide-up stagger-1 leading-tight">
              Your heartfelt message,
              <br />
              <span className="text-burgundy-600 italic">hand-delivered</span>
            </h1>

            {/* Subheading */}
            <p className="text-xl text-ink-medium text-center mb-10 max-w-2xl mx-auto animate-slide-up stagger-2 font-sans leading-relaxed">
              Send personalized cards and letters delivered by local mailers.
              Real people, real connection, real impact.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-slide-up stagger-3">
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

            {/* Envelope illustration */}
            <div className="mb-16">
              <EnvelopeIllustration />
            </div>

            {/* Stats as postage stamps */}
            <div className="flex flex-wrap justify-center gap-8 animate-slide-up stagger-4">
              <PostageStamp>
                <span className="text-3xl font-serif font-bold text-burgundy-600">$7</span>
                <span className="text-xs text-ink-light uppercase tracking-wider mt-1">Standard</span>
              </PostageStamp>

              <PostageStamp>
                <span className="text-3xl font-serif font-bold text-postal-600">24-48h</span>
                <span className="text-xs text-ink-light uppercase tracking-wider mt-1">Delivery</span>
              </PostageStamp>

              <PostageStamp>
                <span className="text-3xl font-serif font-bold text-gold-600">100%</span>
                <span className="text-xs text-ink-light uppercase tracking-wider mt-1">Hand-Delivered</span>
              </PostageStamp>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="divider-ornament px-4">
        <WaxSeal size="sm">M</WaxSeal>
      </div>

      {/* How It Works */}
      <section className="py-20 px-4 bg-paper-white relative">
        <div className="absolute inset-0 paper-texture" />

        <div className="max-w-6xl mx-auto relative">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-center mb-4">
            How It Works
          </h2>
          <p className="text-ink-light text-center mb-16 font-script text-xl">
            Three simple steps to send a heartfelt message
          </p>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {/* Step 1 */}
            <div className="text-center hover-lift vintage-card p-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-cream-100 flex items-center justify-center border-2 border-paper-kraft/30">
                <span className="text-4xl">✏️</span>
              </div>
              <div className="font-script text-burgundy-500 text-2xl mb-2">Step One</div>
              <h3 className="text-2xl font-serif font-semibold mb-3">Create Your Card</h3>
              <p className="text-ink-medium leading-relaxed">
                Choose from beautiful templates or upload your own design.
                Write your heartfelt message with care.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center hover-lift vintage-card p-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-cream-100 flex items-center justify-center border-2 border-paper-kraft/30">
                <span className="text-4xl">💳</span>
              </div>
              <div className="font-script text-postal-500 text-2xl mb-2">Step Two</div>
              <h3 className="text-2xl font-serif font-semibold mb-3">Pay & Confirm</h3>
              <p className="text-ink-medium leading-relaxed">
                Enter the recipient's address and choose standard ($7) or
                rush ($15) delivery.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center hover-lift vintage-card p-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-cream-100 flex items-center justify-center border-2 border-paper-kraft/30">
                <span className="text-4xl">🚶</span>
              </div>
              <div className="font-script text-gold-600 text-2xl mb-2">Step Three</div>
              <h3 className="text-2xl font-serif font-semibold mb-3">Hand-Delivered</h3>
              <p className="text-ink-medium leading-relaxed">
                A local mailer prints and hand-delivers your card with
                photo proof of delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-cream-100 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 postal-stripes opacity-50" />
        <div className="absolute inset-0 paper-texture" />

        <div className="max-w-6xl mx-auto relative">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-center mb-4">
            Why Choose MailIt?
          </h2>
          <p className="text-ink-light text-center mb-16 font-script text-xl">
            Making meaningful connections, one card at a time
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Feature 1 */}
            <div className="flex gap-5 p-6 bg-paper-white/80 backdrop-blur-sm rounded-lg border border-paper-kraft/20 hover-lift">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-burgundy-100 rounded-lg flex items-center justify-center border border-burgundy-200/50">
                  <svg
                    className="w-7 h-7 text-burgundy-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="font-serif font-semibold text-xl mb-2 text-ink-black">Personal Touch</h3>
                <p className="text-ink-medium leading-relaxed">
                  Real people, real delivery. Not a machine—a neighbor who cares about making someone's day special.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-5 p-6 bg-paper-white/80 backdrop-blur-sm rounded-lg border border-paper-kraft/20 hover-lift">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-postal-100 rounded-lg flex items-center justify-center border border-postal-200/50">
                  <svg
                    className="w-7 h-7 text-postal-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="font-serif font-semibold text-xl mb-2 text-ink-black">Fast Delivery</h3>
                <p className="text-ink-medium leading-relaxed">
                  Standard delivery in 24-48 hours. Need it faster? Choose rush delivery for same-day or next-day.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-5 p-6 bg-paper-white/80 backdrop-blur-sm rounded-lg border border-paper-kraft/20 hover-lift">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-gold-100 rounded-lg flex items-center justify-center border border-gold-200/50">
                  <svg
                    className="w-7 h-7 text-gold-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="font-serif font-semibold text-xl mb-2 text-ink-black">Proof of Delivery</h3>
                <p className="text-ink-medium leading-relaxed">
                  Get photo confirmation when your card arrives safely. Know exactly when your message was received.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex gap-5 p-6 bg-paper-white/80 backdrop-blur-sm rounded-lg border border-paper-kraft/20 hover-lift">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-cream-200 rounded-lg flex items-center justify-center border border-paper-kraft/30">
                  <svg
                    className="w-7 h-7 text-ink-medium"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="font-serif font-semibold text-xl mb-2 text-ink-black">Affordable</h3>
                <p className="text-ink-medium leading-relaxed">
                  Just $7 for standard delivery. No hidden fees, no subscriptions, no surprises.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4 bg-paper-white relative overflow-hidden">
        <div className="absolute inset-0 paper-texture" />

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-burgundy-100/30 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-postal-100/30 rounded-full blur-3xl" />

        <div className="max-w-3xl mx-auto text-center relative">
          {/* Wax seal decoration */}
          <div className="mb-8">
            <WaxSeal size="lg">M</WaxSeal>
          </div>

          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
            Ready to Send a Card?
          </h2>

          <p className="text-xl text-ink-medium mb-10 leading-relaxed font-sans">
            Join thousands of people making meaningful connections
            <br className="hidden sm:block" />
            through handwritten cards and personal delivery.
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

          {/* Bottom script text */}
          <p className="mt-12 font-script text-2xl text-ink-light">
            "The art of letter writing is not dead—it's just waiting for you."
          </p>
        </div>
      </section>
    </div>
  )
}

export default Home
