import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react'
import useOrderStore from '../store/orderStore'
import { cardCategories } from '../data/cardTemplates'
import { ordersAPI, paymentAPI } from '../services/api'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

const Checkout = () => {
  const navigate = useNavigate()
  const [processing, setProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState(null)

  const {
    cardType,
    template,
    customImage,
    message,
    recipientName,
    recipientAddress,
    deliveryType,
    setDeliveryType,
    getOrderSummary,
    reset,
  } = useOrderStore()

  const price = deliveryType === 'rush' ? 15 : 7
  const cardTypeName = cardCategories.find((c) => c.id === cardType)?.name

  // Redirect if no card selected
  if (!cardType) {
    navigate('/create')
    return null
  }

  const handlePlaceOrder = async () => {
    setProcessing(true)
    setPaymentError(null)

    try {
      // 1. Create payment intent
      const paymentIntent = await paymentAPI.createPaymentIntent(price)

      // TODO: Integrate Stripe Elements for actual payment
      // For now, simulating successful payment

      // 2. Create order
      const orderData = {
        ...getOrderSummary(),
        cardImageUrl: customImage || template?.imageUrl,
        paymentIntentId: paymentIntent.data.id,
      }

      const response = await ordersAPI.create(orderData)

      // 3. Reset store and navigate to order detail
      const orderId = response.data.id
      reset()
      navigate(`/orders/${orderId}`, {
        state: { orderPlaced: true },
      })
    } catch (error) {
      console.error('Order creation failed:', error)
      setPaymentError(
        error.response?.data?.message ||
          'Failed to process order. Please try again.'
      )
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Order Summary */}
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            <div className="space-y-4">
              {/* Card Preview */}
              <div className="flex gap-4">
                <div className="w-20 h-28 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  {(customImage || template?.imageUrl) && (
                    <img
                      src={customImage || template.imageUrl}
                      alt="Card"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900">{cardTypeName} Card</h3>
                  <p className="text-sm text-gray-600 mt-1 truncate">
                    {template?.name || 'Custom Design'}
                  </p>
                </div>
              </div>

              {/* Recipient */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Recipient
                </h4>
                <p className="text-gray-900">{recipientName}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {recipientAddress.street}<br />
                  {recipientAddress.city}, {recipientAddress.state}{' '}
                  {recipientAddress.zipCode}
                </p>
              </div>

              {/* Message Preview */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Your Message
                </h4>
                <p className="text-sm text-gray-700 line-clamp-3">
                  {message}
                </p>
              </div>
            </div>
          </Card>

          {/* Delivery Type Selection */}
          <Card>
            <h2 className="text-lg font-semibold mb-4">Delivery Type</h2>

            <div className="space-y-3">
              <label
                className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  deliveryType === 'standard'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="deliveryType"
                    value="standard"
                    checked={deliveryType === 'standard'}
                    onChange={(e) => setDeliveryType(e.target.value)}
                    className="w-4 h-4 text-primary-600"
                  />
                  <div>
                    <p className="font-medium">Standard Delivery</p>
                    <p className="text-sm text-gray-600">24-48 hours</p>
                  </div>
                </div>
                <p className="font-bold text-primary-600">$7.00</p>
              </label>

              <label
                className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  deliveryType === 'rush'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="deliveryType"
                    value="rush"
                    checked={deliveryType === 'rush'}
                    onChange={(e) => setDeliveryType(e.target.value)}
                    className="w-4 h-4 text-primary-600"
                  />
                  <div>
                    <p className="font-medium">Rush Delivery</p>
                    <p className="text-sm text-gray-600">12-24 hours</p>
                  </div>
                </div>
                <p className="font-bold text-primary-600">$15.00</p>
              </label>
            </div>
          </Card>
        </div>

        {/* Right: Payment */}
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold mb-4">Payment</h2>

            {/* Stripe Payment Placeholder */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <svg
                className="w-12 h-12 mx-auto text-gray-400 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              <p className="text-gray-600 font-medium">
                Stripe Payment Integration
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Payment form will appear here
              </p>
            </div>

            {paymentError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{paymentError}</p>
              </div>
            )}
          </Card>

          {/* Order Total */}
          <Card>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Processing Fee</span>
                <span>$0.00</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary-600">${price.toFixed(2)}</span>
              </div>
            </div>
          </Card>

          {/* Place Order Button */}
          <SignedIn>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={processing}
              onClick={handlePlaceOrder}
            >
              Place Order
            </Button>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="primary" size="lg" fullWidth>
                Sign In to Place Order
              </Button>
            </SignInButton>
          </SignedOut>

          <p className="text-xs text-gray-500 text-center">
            By placing your order, you agree to our Terms of Service and Privacy
            Policy
          </p>
        </div>
      </div>
    </div>
  )
}

export default Checkout
