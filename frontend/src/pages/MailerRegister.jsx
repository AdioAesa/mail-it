import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react'
import { mailersAPI } from '../services/api'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Button from '../components/ui/Button'

const MailerRegister = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    radius: '5',
    availability: 'flexible',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await mailersAPI.register(formData)
      // Redirect to mailer dashboard
      navigate('/mailer', {
        state: { registered: true },
      })
    } catch (err) {
      console.error('Registration failed:', err)
      setError(
        err.response?.data?.message ||
          'Failed to complete registration. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Become a Mailer</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Earn money delivering handwritten cards in your neighborhood. Flexible
          schedule, easy work, meaningful impact.
        </p>
      </div>

      {/* Benefits */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card className="text-center">
          <div className="text-4xl mb-3">💰</div>
          <h3 className="font-semibold text-lg mb-2">Earn $5-$10 per delivery</h3>
          <p className="text-gray-600 text-sm">
            Get paid for each card you deliver. Rush deliveries pay more!
          </p>
        </Card>

        <Card className="text-center">
          <div className="text-4xl mb-3">📅</div>
          <h3 className="font-semibold text-lg mb-2">Flexible Schedule</h3>
          <p className="text-gray-600 text-sm">
            Accept jobs when you want. Work as much or as little as you like.
          </p>
        </Card>

        <Card className="text-center">
          <div className="text-4xl mb-3">🚶</div>
          <h3 className="font-semibold text-lg mb-2">Stay Local</h3>
          <p className="text-gray-600 text-sm">
            Only deliver in your area. Set your own delivery radius.
          </p>
        </Card>
      </div>

      {/* How It Works */}
      <Card className="mb-12">
        <h2 className="text-2xl font-bold mb-6">How It Works</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
              1
            </div>
            <div>
              <h3 className="font-semibold mb-1">Sign Up</h3>
              <p className="text-gray-600">
                Register with your address and set your delivery preferences
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
              2
            </div>
            <div>
              <h3 className="font-semibold mb-1">Accept Jobs</h3>
              <p className="text-gray-600">
                Browse available delivery jobs in your area and accept the ones you want
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
              3
            </div>
            <div>
              <h3 className="font-semibold mb-1">Print & Deliver</h3>
              <p className="text-gray-600">
                Print the card at home, hand-deliver it, and upload proof of delivery
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
              4
            </div>
            <div>
              <h3 className="font-semibold mb-1">Get Paid</h3>
              <p className="text-gray-600">
                Receive payment directly to your bank account via Stripe Connect
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Registration Form */}
      <SignedOut>
        <Card>
          <div className="text-center py-8">
            <h3 className="text-xl font-semibold mb-4">Ready to get started?</h3>
            <SignInButton mode="modal">
              <Button variant="primary" size="lg">
                Sign In to Register
              </Button>
            </SignInButton>
          </div>
        </Card>
      </SignedOut>

      <SignedIn>
        <Card>
          <h2 className="text-2xl font-bold mb-6">Registration Form</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Your Address</h3>

              <Input
                label="Street Address"
                required
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="123 Main St"
              />

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="City"
                  required
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="New York"
                />

                <Select
                  label="State"
                  required
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  options={[
                    { value: '', label: 'Select State' },
                    { value: 'NY', label: 'New York' },
                    { value: 'CA', label: 'California' },
                    { value: 'TX', label: 'Texas' },
                    { value: 'FL', label: 'Florida' },
                    // Add more states
                  ]}
                />
              </div>

              <Input
                label="ZIP Code"
                required
                value={formData.zipCode}
                onChange={(e) => handleChange('zipCode', e.target.value)}
                placeholder="10001"
                maxLength={5}
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Delivery Preferences</h3>

              <Select
                label="Delivery Radius"
                required
                value={formData.radius}
                onChange={(e) => handleChange('radius', e.target.value)}
                options={[
                  { value: '1', label: '1 mile' },
                  { value: '3', label: '3 miles' },
                  { value: '5', label: '5 miles' },
                  { value: '10', label: '10 miles' },
                  { value: '15', label: '15 miles' },
                ]}
              />

              <Select
                label="Availability"
                required
                value={formData.availability}
                onChange={(e) => handleChange('availability', e.target.value)}
                options={[
                  { value: 'flexible', label: 'Flexible - Anytime' },
                  { value: 'weekdays', label: 'Weekdays Only' },
                  { value: 'weekends', label: 'Weekends Only' },
                  { value: 'evenings', label: 'Evenings Only' },
                ]}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">
                Stripe Connect Setup Required
              </h4>
              <p className="text-sm text-blue-800">
                After registration, you'll be redirected to Stripe to set up your
                payout account. This is required to receive payments for deliveries.
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => navigate('/')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={submitting}
              >
                Complete Registration
              </Button>
            </div>
          </form>
        </Card>
      </SignedIn>
    </div>
  )
}

export default MailerRegister
