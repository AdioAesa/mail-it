import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { ordersAPI } from '../services/api'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import StatusTimeline from '../components/orders/StatusTimeline'
import { PageSpinner } from '../components/ui/Spinner'

const OrderDetail = () => {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(
    location.state?.orderPlaced || false
  )

  useEffect(() => {
    fetchOrder()
  }, [id])

  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => setShowSuccessMessage(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [showSuccessMessage])

  const fetchOrder = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await ordersAPI.getById(id)
      setOrder(response.data)
    } catch (err) {
      console.error('Failed to fetch order:', err)
      setError('Failed to load order details.')
      // Mock data for demo
      setOrder(mockOrder)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    setCancelling(true)
    try {
      await ordersAPI.cancel(id)
      setShowCancelModal(false)
      fetchOrder() // Refresh order data
    } catch (err) {
      console.error('Failed to cancel order:', err)
      alert('Failed to cancel order. Please try again.')
    } finally {
      setCancelling(false)
    }
  }

  const getStatusVariant = (status) => {
    const variants = {
      pending: 'warning',
      accepted: 'info',
      printing: 'info',
      in_transit: 'purple',
      delivered: 'success',
      cancelled: 'danger',
    }
    return variants[status] || 'default'
  }

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      accepted: 'Accepted',
      printing: 'Printing',
      in_transit: 'In Transit',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    }
    return labels[status] || status
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  if (loading) return <PageSpinner message="Loading order..." />

  if (error && !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/orders')}>
            Back to Orders
          </Button>
        </div>
      </div>
    )
  }

  const canCancel = order.status === 'pending' || order.status === 'accepted'

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-slide-up">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-green-800 font-medium">
              Order placed successfully! Your card is being processed.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate('/orders')}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-2xl font-bold">
              Order #{order.orderNumber || order.id.slice(0, 8)}
            </h1>
            <Badge variant={getStatusVariant(order.status)}>
              {getStatusLabel(order.status)}
            </Badge>
          </div>
          <p className="text-gray-600 ml-9">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>

        {canCancel && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowCancelModal(true)}
          >
            Cancel Order
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Card Details */}
          <Card>
            <h2 className="text-lg font-semibold mb-4">Card Details</h2>

            <div className="aspect-[2/3] bg-gray-100 rounded-lg overflow-hidden mb-4">
              {order.cardImageUrl && (
                <img
                  src={order.cardImageUrl}
                  alt="Card"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Card Type</p>
                <p className="font-medium">{order.cardType || 'Custom'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Message</p>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {order.message}
                </p>
              </div>
            </div>
          </Card>

          {/* Recipient */}
          <Card>
            <h2 className="text-lg font-semibold mb-4">Recipient</h2>
            <div className="space-y-2">
              <p className="font-medium text-gray-900">{order.recipientName}</p>
              <p className="text-gray-600">
                {order.recipientAddress?.street}<br />
                {order.recipientAddress?.city}, {order.recipientAddress?.state}{' '}
                {order.recipientAddress?.zipCode}
              </p>
            </div>
          </Card>

          {/* Delivery Proof */}
          {order.deliveryProofUrl && (
            <Card>
              <h2 className="text-lg font-semibold mb-4">Delivery Proof</h2>
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={order.deliveryProofUrl}
                  alt="Delivery proof"
                  className="w-full h-full object-cover"
                />
              </div>
              {order.deliveredAt && (
                <p className="text-sm text-gray-600 mt-2">
                  Delivered on {formatDate(order.deliveredAt)}
                </p>
              )}
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Status Timeline */}
          <Card>
            <h2 className="text-lg font-semibold mb-4">Delivery Status</h2>
            <StatusTimeline
              currentStatus={order.status}
              statusHistory={order.statusHistory || []}
            />
          </Card>

          {/* Order Summary */}
          <Card>
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Delivery Type</span>
                <span className="capitalize">{order.deliveryType || 'Standard'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${order.price?.toFixed(2) || '7.00'}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary-600">
                  ${order.price?.toFixed(2) || '7.00'}
                </span>
              </div>
            </div>
          </Card>

          {/* Mailer Info (if assigned) */}
          {order.mailer && (
            <Card>
              <h2 className="text-lg font-semibold mb-4">Your Mailer</h2>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary-600">
                    {order.mailer.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{order.mailer.name}</p>
                  <p className="text-sm text-gray-600">
                    {order.mailer.deliveryCount || 0} deliveries
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Order"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to cancel this order? This action cannot be undone.
          </p>
          <p className="text-sm text-gray-600">
            You will receive a full refund within 5-7 business days.
          </p>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowCancelModal(false)}
            >
              Keep Order
            </Button>
            <Button
              variant="danger"
              fullWidth
              loading={cancelling}
              onClick={handleCancelOrder}
            >
              Cancel Order
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// Mock data for demo
const mockOrder = {
  id: '1',
  orderNumber: 'ORD-001',
  status: 'in_transit',
  recipientName: 'Jane Smith',
  recipientAddress: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
  },
  cardType: 'Birthday',
  cardImageUrl: 'https://picsum.photos/seed/order1/400/600',
  message: 'Happy Birthday! Wishing you all the best on your special day. May this year bring you joy, success, and wonderful memories!',
  deliveryType: 'standard',
  price: 7,
  createdAt: '2024-01-15T10:00:00Z',
  statusHistory: [
    { status: 'pending', timestamp: '2024-01-15T10:00:00Z' },
    { status: 'accepted', timestamp: '2024-01-15T11:30:00Z' },
    { status: 'printing', timestamp: '2024-01-15T14:00:00Z' },
    { status: 'in_transit', timestamp: '2024-01-16T09:00:00Z' },
  ],
  mailer: {
    name: 'Mike Johnson',
    deliveryCount: 47,
  },
}

export default OrderDetail
