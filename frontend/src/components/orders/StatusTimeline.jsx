/**
 * Status timeline component
 * Visual representation of order status progression
 */
const StatusTimeline = ({ currentStatus, statusHistory = [] }) => {
  const statuses = [
    { id: 'pending', label: 'Order Placed', icon: '📝' },
    { id: 'accepted', label: 'Accepted by Mailer', icon: '👋' },
    { id: 'printing', label: 'Printing Card', icon: '🖨️' },
    { id: 'in_transit', label: 'Out for Delivery', icon: '🚶' },
    { id: 'delivered', label: 'Delivered', icon: '✅' },
  ]

  const currentStatusIndex = statuses.findIndex((s) => s.id === currentStatus)

  const getStatusData = (statusId) => {
    return statusHistory.find((h) => h.status === statusId)
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-4">
      {statuses.map((status, index) => {
        const isCompleted = index <= currentStatusIndex
        const isCurrent = index === currentStatusIndex
        const statusData = getStatusData(status.id)

        return (
          <div key={status.id} className="flex gap-4">
            {/* Timeline indicator */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${
                  isCompleted
                    ? 'bg-primary-100 border-2 border-primary-500'
                    : 'bg-gray-100 border-2 border-gray-300'
                } ${isCurrent ? 'ring-4 ring-primary-100' : ''}`}
              >
                {status.icon}
              </div>
              {index < statuses.length - 1 && (
                <div
                  className={`w-0.5 h-12 ${
                    isCompleted ? 'bg-primary-500' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>

            {/* Status info */}
            <div className="flex-1 pb-8">
              <h4
                className={`font-medium ${
                  isCompleted ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                {status.label}
              </h4>
              {statusData && (
                <p className="text-sm text-gray-600 mt-1">
                  {formatTime(statusData.timestamp)}
                </p>
              )}
              {statusData?.note && (
                <p className="text-sm text-gray-500 mt-1">{statusData.note}</p>
              )}
              {isCurrent && !statusData && (
                <p className="text-sm text-primary-600 mt-1">In progress...</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default StatusTimeline
