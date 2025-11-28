import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { jobsAPI } from '../services/api'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import DeliveryProof from '../components/mailer/DeliveryProof'
import { PageSpinner } from '../components/ui/Spinner'

const JobDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    fetchJob()
  }, [id])

  const fetchJob = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await jobsAPI.getById(id)
      setJob(response.data)
    } catch (err) {
      console.error('Failed to fetch job:', err)
      setError('Failed to load job details.')
      // Mock data for demo
      setJob(mockJob)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (newStatus) => {
    setUpdatingStatus(true)
    try {
      await jobsAPI.updateStatus(id, newStatus)
      fetchJob() // Refresh job data
    } catch (err) {
      console.error('Failed to update status:', err)
      alert('Failed to update status. Please try again.')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleUploadProof = async (formData) => {
    try {
      await jobsAPI.uploadProof(id, formData)
      // Update status to delivered
      await handleUpdateStatus('delivered')
    } catch (err) {
      console.error('Failed to upload proof:', err)
      throw err
    }
  }

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

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      accepted: 'printing',
      printing: 'in_transit',
      in_transit: 'delivered',
    }
    return statusFlow[currentStatus]
  }

  const getStatusLabel = (status) => {
    const labels = {
      available: 'Available',
      accepted: 'Accepted',
      printing: 'Printing',
      in_transit: 'In Transit',
      delivered: 'Delivered',
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

  if (loading) return <PageSpinner message="Loading job..." />

  if (error && !job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/mailer')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const nextStatus = getNextStatus(job.status)
  const canUpdateStatus = nextStatus && job.status !== 'delivered'

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate('/mailer')}
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
              Job #{job.orderNumber || job.id.slice(0, 8)}
            </h1>
            <Badge variant={getStatusVariant(job.status)}>
              {getStatusLabel(job.status)}
            </Badge>
          </div>
          <p className="text-gray-600 ml-9">
            Accepted on {formatDate(job.acceptedAt || job.createdAt)}
          </p>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-primary-600">
            ${job.payout.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">
            {job.deliveryType === 'rush' ? 'Rush' : 'Standard'}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Card to Print */}
          <Card>
            <h2 className="text-lg font-semibold mb-4">Card to Print</h2>

            <div className="aspect-[2/3] bg-gray-100 rounded-lg overflow-hidden mb-4">
              {job.cardImageUrl && (
                <img
                  src={job.cardImageUrl}
                  alt="Card"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <Button
              variant="outline"
              fullWidth
              onClick={() => window.open(job.cardImageUrl, '_blank')}
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download for Printing
            </Button>
          </Card>

          {/* Message */}
          <Card>
            <h2 className="text-lg font-semibold mb-4">Message Inside</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{job.message}</p>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Delivery Address */}
          <Card>
            <h2 className="text-lg font-semibold mb-4">Delivery Address</h2>
            <div className="space-y-2">
              <p className="font-medium text-gray-900">{job.recipientName}</p>
              <p className="text-gray-600">
                {job.recipientAddress?.street}<br />
                {job.recipientAddress?.city}, {job.recipientAddress?.state}{' '}
                {job.recipientAddress?.zipCode}
              </p>
            </div>

            <div className="mt-4 pt-4 border-t">
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  const address = `${job.recipientAddress.street}, ${job.recipientAddress.city}, ${job.recipientAddress.state} ${job.recipientAddress.zipCode}`
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
                    '_blank'
                  )
                }}
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
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Open in Maps
              </Button>
            </div>
          </Card>

          {/* Status Actions */}
          <Card>
            <h2 className="text-lg font-semibold mb-4">Update Status</h2>

            <div className="space-y-3">
              {job.status === 'accepted' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    Print the card and mark as "Printing" when you start.
                  </p>
                </div>
              )}

              {job.status === 'printing' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    Mark as "In Transit" when you leave for delivery.
                  </p>
                </div>
              )}

              {job.status === 'in_transit' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    Upload delivery proof photo to complete the job.
                  </p>
                </div>
              )}

              {canUpdateStatus && job.status !== 'in_transit' && (
                <Button
                  variant="primary"
                  fullWidth
                  loading={updatingStatus}
                  onClick={() => handleUpdateStatus(nextStatus)}
                >
                  Mark as {getStatusLabel(nextStatus)}
                </Button>
              )}

              {job.status === 'delivered' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
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
                      Job completed! Payment will be processed within 24 hours.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Delivery Proof Upload */}
          {job.status === 'in_transit' && (
            <DeliveryProof
              onUpload={handleUploadProof}
              existingProof={job.deliveryProofUrl}
            />
          )}

          {job.deliveryProofUrl && (
            <Card>
              <h2 className="text-lg font-semibold mb-4">Delivery Proof</h2>
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={job.deliveryProofUrl}
                  alt="Delivery proof"
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

// Mock data for demo
const mockJob = {
  id: '3',
  orderNumber: 'ORD-100',
  status: 'printing',
  recipientName: 'Jane Smith',
  recipientAddress: {
    street: '456 Park Ave',
    city: 'Manhattan',
    state: 'NY',
    zipCode: '10022',
  },
  cardType: 'Christmas',
  cardImageUrl: 'https://picsum.photos/seed/job1/400/600',
  message: 'Merry Christmas! Wishing you and your family a wonderful holiday season filled with joy, love, and happiness.',
  deliveryType: 'standard',
  payout: 5,
  distance: 1.5,
  createdAt: '2024-01-19T14:00:00Z',
  acceptedAt: '2024-01-19T15:30:00Z',
}

export default JobDetail
