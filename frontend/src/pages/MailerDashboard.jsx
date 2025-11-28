import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react'
import { jobsAPI, mailersAPI } from '../services/api'
import JobCard from '../components/mailer/JobCard'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { PageSpinner } from '../components/ui/Spinner'

const MailerDashboard = () => {
  const location = useLocation()
  const [availableJobs, setAvailableJobs] = useState([])
  const [myJobs, setMyJobs] = useState([])
  const [earnings, setEarnings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('available')
  const [showSuccessMessage, setShowSuccessMessage] = useState(
    location.state?.registered || false
  )

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => setShowSuccessMessage(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [showSuccessMessage])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [availableResponse, myJobsResponse, earningsResponse] =
        await Promise.all([
          jobsAPI.getAvailable(),
          jobsAPI.getMyJobs(),
          mailersAPI.getEarnings(),
        ])

      setAvailableJobs(availableResponse.data)
      setMyJobs(myJobsResponse.data)
      setEarnings(earningsResponse.data)
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
      setError('Failed to load dashboard data.')
      // Mock data for demo
      setAvailableJobs(mockAvailableJobs)
      setMyJobs(mockMyJobs)
      setEarnings(mockEarnings)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptJob = async (jobId) => {
    try {
      await jobsAPI.accept(jobId)
      fetchDashboardData() // Refresh data
    } catch (err) {
      console.error('Failed to accept job:', err)
      alert('Failed to accept job. Please try again.')
    }
  }

  if (loading) return <PageSpinner message="Loading dashboard..." />

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
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
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <h2 className="text-2xl font-bold mb-2">Sign in to access dashboard</h2>
          <p className="text-gray-600 mb-6">
            View available jobs and manage your deliveries
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
                  Registration successful! You can now accept delivery jobs.
                </p>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Mailer Dashboard</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboardData}
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

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Earnings Summary */}
          {earnings && (
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <Card>
                <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
                <p className="text-2xl font-bold text-primary-600">
                  ${earnings.total.toFixed(2)}
                </p>
              </Card>

              <Card>
                <p className="text-sm text-gray-600 mb-1">This Week</p>
                <p className="text-2xl font-bold text-accent-600">
                  ${earnings.thisWeek.toFixed(2)}
                </p>
              </Card>

              <Card>
                <p className="text-sm text-gray-600 mb-1">Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">
                  {earnings.totalDeliveries}
                </p>
              </Card>

              <Card>
                <p className="text-sm text-gray-600 mb-1">Pending Payout</p>
                <p className="text-2xl font-bold text-green-600">
                  ${earnings.pending.toFixed(2)}
                </p>
              </Card>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('available')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'available'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Available Jobs ({availableJobs.length})
            </button>
            <button
              onClick={() => setActiveTab('my-jobs')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'my-jobs'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              My Jobs ({myJobs.length})
            </button>
          </div>

          {/* Available Jobs */}
          {activeTab === 'available' && (
            <div className="space-y-4">
              {availableJobs.length > 0 ? (
                availableJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onAccept={handleAcceptJob}
                  />
                ))
              ) : (
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
                  <h3 className="text-lg font-semibold mb-2">
                    No available jobs
                  </h3>
                  <p className="text-gray-600">
                    Check back later for new delivery opportunities in your area
                  </p>
                </div>
              )}
            </div>
          )}

          {/* My Jobs */}
          {activeTab === 'my-jobs' && (
            <div className="space-y-4">
              {myJobs.length > 0 ? (
                myJobs.map((job) => (
                  <JobCard key={job.id} job={job} isActive />
                ))
              ) : (
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
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold mb-2">
                    No active jobs
                  </h3>
                  <p className="text-gray-600">
                    Accept jobs from the "Available Jobs" tab to get started
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </SignedIn>
    </div>
  )
}

// Mock data for demo
const mockAvailableJobs = [
  {
    id: '1',
    orderNumber: 'ORD-101',
    cardType: 'Birthday',
    recipientCity: 'Brooklyn',
    recipientState: 'NY',
    deliveryType: 'standard',
    payout: 5,
    distance: 2.3,
    createdAt: '2024-01-20T10:00:00Z',
  },
  {
    id: '2',
    orderNumber: 'ORD-102',
    cardType: 'Thank You',
    recipientCity: 'Queens',
    recipientState: 'NY',
    deliveryType: 'rush',
    payout: 10,
    distance: 4.1,
    createdAt: '2024-01-20T11:30:00Z',
  },
]

const mockMyJobs = [
  {
    id: '3',
    orderNumber: 'ORD-100',
    cardType: 'Christmas',
    recipientCity: 'Manhattan',
    recipientState: 'NY',
    deliveryType: 'standard',
    payout: 5,
    distance: 1.5,
    status: 'printing',
    createdAt: '2024-01-19T14:00:00Z',
  },
]

const mockEarnings = {
  total: 235.50,
  thisWeek: 45.00,
  totalDeliveries: 47,
  pending: 15.00,
}

export default MailerDashboard
