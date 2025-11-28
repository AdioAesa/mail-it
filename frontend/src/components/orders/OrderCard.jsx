import { useNavigate } from 'react-router-dom'
import Card from '../ui/Card'
import Badge from '../ui/Badge'

/**
 * Order card component for displaying order summary in list
 */
const OrderCard = ({ order }) => {
  const navigate = useNavigate()

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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <Card
      hover
      clickable
      onClick={() => navigate(`/orders/${order.id}`)}
      className="animate-fade-in"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Order Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900">
              Order #{order.orderNumber || order.id.slice(0, 8)}
            </h3>
            <Badge variant={getStatusVariant(order.status)}>
              {getStatusLabel(order.status)}
            </Badge>
          </div>

          <div className="space-y-1 text-sm text-gray-600">
            <p className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="truncate">To: {order.recipientName}</span>
            </p>

            <p className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="truncate">{order.recipientCity}, {order.recipientState}</span>
            </p>

            <p className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{formatDate(order.createdAt)}</span>
            </p>
          </div>
        </div>

        {/* Thumbnail & Price */}
        <div className="flex flex-col items-end gap-2">
          {order.cardImageUrl && (
            <div className="w-16 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
              <img
                src={order.cardImageUrl}
                alt="Card"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <p className="font-semibold text-primary-600">
            ${order.price?.toFixed(2) || '7.00'}
          </p>
        </div>
      </div>
    </Card>
  )
}

export default OrderCard
