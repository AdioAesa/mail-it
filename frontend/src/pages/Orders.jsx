import { useState, useEffect } from 'react'
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react'
import { ordersAPI } from '../services/api'
import OrderCard from '../components/orders/OrderCard'
import Button from '../components/ui/Button'
import { PageSpinner } from '../components/ui/Spinner'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchOrders()
  }, [filter])

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)

    try {
      const filters = filter === 'all' ? {} : { status: filter }
      const response = await ordersAPI.getAll(filters)
      setOrders(response.data)
    } catch (err) {
      console.error('Failed to fetch orders:', err)
      setError('Failed to load orders. Please try again.')
      // Mock data for demo
      setOrders(mockOrders)
    } finally {
      setLoading(false)
    }
  }

  const filterOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_transit', label: 'In Transit' },
    { value: 'delivered', label: 'Delivered' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <SignedOut>
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h2 className="text-2xl font-bold mb-2">Sign in to view your orders</h2>
          <p className="text-gray-600 mb-6">
            Track your card deliveries and view order history
          </p>
          <SignInButton mode="modal">
            <Button variant="primary" size="lg">
              Sign In
            </Button>
          </SignInButton>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">My Orders</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchOrders}
              disabled={loading}
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </Button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  filter === option.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && <PageSpinner message="Loading orders..." />}

          {/* Orders List */}
          {!loading && orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && orders.length === 0 && (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 mx-auto text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-6">
                Start sending heartfelt cards to your loved ones
              </p>
              <Button variant="primary" onClick={() => window.location.href = '/create'}>
                Create Your First Card
              </Button>
            </div>
          )}
        </div>
      </SignedIn>
    </div>
  )
}

// Mock data for demo purposes
const mockOrders = [
  {
    id: '1',
    orderNumber: 'ORD-001',
    status: 'delivered',
    recipientName: 'Jane Smith',
    recipientCity: 'New York',
    recipientState: 'NY',
    cardImageUrl: 'https://picsum.photos/seed/order1/400/600',
    price: 7,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    orderNumber: 'ORD-002',
    status: 'in_transit',
    recipientName: 'John Doe',
    recipientCity: 'Los Angeles',
    recipientState: 'CA',
    cardImageUrl: 'https://picsum.photos/seed/order2/400/600',
    price: 15,
    createdAt: '2024-01-18T14:30:00Z',
  },
  {
    id: '3',
    orderNumber: 'ORD-003',
    status: 'pending',
    recipientName: 'Sarah Johnson',
    recipientCity: 'Chicago',
    recipientState: 'IL',
    cardImageUrl: 'https://picsum.photos/seed/order3/400/600',
    price: 7,
    createdAt: '2024-01-20T09:15:00Z',
  },
]

export default Orders
