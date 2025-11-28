import { useNavigate } from 'react-router-dom'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'

/**
 * Job card component for mailer dashboard
 * Shows available jobs and active jobs
 */
const JobCard = ({ job, isActive = false, onAccept }) => {
  const navigate = useNavigate()

  const getStatusVariant = (status) => {
    const variants = {
      available: 'info',
      accepted: 'warning',
      printing: 'warning',
      in_transit: 'purple',
      delivered: 'success',
    }
    return variants[status] || 'default'
  }

  const calculateDistance = (distance) => {
    if (distance < 1) {
      return `${(distance * 5280).toFixed(0)} ft`
    }
    return `${distance.toFixed(1)} mi`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <Card hover className="animate-fade-in">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900">
                {job.cardType} Card
              </h3>
              {isActive && (
                <Badge variant={getStatusVariant(job.status)}>
                  {job.status.replace('_', ' ')}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600">
              Order #{job.orderNumber || job.id.slice(0, 8)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-primary-600">
              ${job.payout.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">
              {job.deliveryType === 'rush' ? 'Rush' : 'Standard'}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <span className="truncate">
              {job.recipientCity}, {job.recipientState}
            </span>
            {job.distance && (
              <Badge size="sm" variant="default">
                {calculateDistance(job.distance)}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>Created {formatDate(job.createdAt)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {!isActive && onAccept && (
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => onAccept(job.id)}
            >
              Accept Job
            </Button>
          )}
          {isActive && (
            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={() => navigate(`/mailer/jobs/${job.id}`)}
            >
              View Details
            </Button>
          )}
          {!isActive && (
            <Button
              variant="ghost"
              size="md"
              onClick={() => navigate(`/mailer/jobs/${job.id}`)}
            >
              Details
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

export default JobCard
