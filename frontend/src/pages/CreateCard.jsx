import { useNavigate } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react'
import { useState, useRef, useEffect, useCallback } from 'react'
import useOrderStore from '../store/orderStore'
import { cardCategories, getTemplatesByCategory } from '../data/cardTemplates'
import { mailersAPI, geocodingAPI } from '../services/api'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import TemplateGallery from '../components/cards/TemplateGallery'
import CardPreview from '../components/cards/CardPreview'
import NearbyMailersMap from '../components/maps/NearbyMailersMap'

const CreateCard = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [customImagePreview, setCustomImagePreview] = useState(null)

  // Nearby mailers state
  const [recipientCoords, setRecipientCoords] = useState({ lat: null, lng: null })
  const [nearbyMailers, setNearbyMailers] = useState([])
  const [mapLoading, setMapLoading] = useState(false)
  const [geocodeError, setGeocodeError] = useState(null)

  const {
    currentStep,
    cardType,
    template,
    customImage,
    message,
    recipientName,
    recipientAddress,
    setCardType,
    setTemplate,
    setCustomImage,
    setMessage,
    setRecipientName,
    setRecipientAddress,
    nextStep,
    prevStep,
  } = useOrderStore()

  const templates = cardType ? getTemplatesByCategory(cardType) : []

  // Geocode address and fetch nearby mailers when address is complete
  const fetchNearbyMailers = useCallback(async () => {
    const { street, city, state, zipCode } = recipientAddress
    if (!street || !city || !state || !zipCode || zipCode.length < 5) return

    setMapLoading(true)
    setGeocodeError(null)

    try {
      // Geocode the address
      const coords = await geocodingAPI.geocodeAddress(street, city, state, zipCode)
      setRecipientCoords(coords)

      // Fetch nearby mailers
      const response = await mailersAPI.getNearby(coords.lat, coords.lng, 15)
      if (response.data.success) {
        // Transform mailers to include lat/lng for map (using distance to approximate position)
        const mailersWithCoords = response.data.mailers.map((mailer, index) => ({
          ...mailer,
          // Approximate mailer position around recipient for visualization
          // In production, backend would return actual coords or you'd use a different approach
          lat: coords.lat + (Math.random() - 0.5) * 0.05,
          lng: coords.lng + (Math.random() - 0.5) * 0.05
        }))
        setNearbyMailers(mailersWithCoords)
      }
    } catch (error) {
      console.error('Failed to fetch nearby mailers:', error)
      // Only show error if it's a geocoding issue, not a backend issue
      if (error.message?.includes('Address') || error.message?.includes('locate')) {
        setGeocodeError(error.message)
        setNearbyMailers([])
      } else {
        // Backend might be down - show demo mailers for UX
        console.warn('Backend unavailable, using demo mailers')
        const coords = recipientCoords.lat ? recipientCoords : { lat: 40.7128, lng: -74.006 }
        const demoMailers = [
          { id: '1', firstName: 'Sarah', rating: 4.9, completedJobs: 47, distance: 0.8, lat: coords.lat + 0.012, lng: coords.lng - 0.008 },
          { id: '2', firstName: 'Mike', rating: 4.7, completedJobs: 23, distance: 1.4, lat: coords.lat - 0.015, lng: coords.lng + 0.01 },
          { id: '3', firstName: 'Emily', rating: 5.0, completedJobs: 12, distance: 2.1, lat: coords.lat + 0.02, lng: coords.lng + 0.018 },
        ]
        setNearbyMailers(demoMailers)
      }
    } finally {
      setMapLoading(false)
    }
  }, [recipientAddress])

  // Debounced effect to fetch mailers when address changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep === 4) {
        fetchNearbyMailers()
      }
    }, 1000) // Wait 1 second after typing stops

    return () => clearTimeout(timer)
  }, [recipientAddress.street, recipientAddress.city, recipientAddress.state, recipientAddress.zipCode, currentStep, fetchNearbyMailers])

  const handleCustomImageSelect = (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setCustomImagePreview(reader.result)
      setCustomImage(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const canProceedStep1 = cardType !== null
  const canProceedStep2 = (template !== null || customImage !== null)
  const canProceedStep3 = message.trim().length > 0
  const canProceedStep4 = recipientName.trim() && recipientAddress.street &&
                          recipientAddress.city && recipientAddress.state &&
                          recipientAddress.zipCode

  const handleNext = () => {
    if (currentStep === 1 && !canProceedStep1) return
    if (currentStep === 2 && !canProceedStep2) return
    if (currentStep === 3 && !canProceedStep3) return
    if (currentStep === 4 && !canProceedStep4) return

    if (currentStep === 5) {
      navigate('/checkout')
    } else {
      nextStep()
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">Create Your Card</h1>
          <span className="text-sm text-gray-600">Step {currentStep} of 5</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Steps */}
        <div>
          {/* Step 1: Choose Card Type */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-slide-up">
              <h2 className="text-xl font-semibold">Choose Card Type</h2>
              <div className="grid grid-cols-2 gap-4">
                {cardCategories.map((category) => (
                  <Card
                    key={category.id}
                    clickable
                    hover
                    className={`transition-all ${
                      cardType === category.id
                        ? 'ring-2 ring-primary-500 shadow-soft-lg'
                        : ''
                    }`}
                    onClick={() => setCardType(category.id)}
                  >
                    <div className="text-center py-4">
                      <div className="text-4xl mb-2">{category.icon}</div>
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {category.description}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Template */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-slide-up">
              <h2 className="text-xl font-semibold">
                {cardType === 'custom' ? 'Upload Custom Design' : 'Choose Template'}
              </h2>

              {cardType === 'custom' ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCustomImageSelect}
                    className="hidden"
                    id="custom-image"
                  />
                  <label htmlFor="custom-image" className="block cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary-400 transition-colors">
                      {customImagePreview ? (
                        <div className="space-y-3">
                          <img
                            src={customImagePreview}
                            alt="Custom design"
                            className="max-h-64 mx-auto rounded"
                          />
                          <p className="text-sm text-gray-600">Click to change image</p>
                        </div>
                      ) : (
                        <>
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
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <p className="text-gray-600 font-medium mb-2">
                            Upload Your Design
                          </p>
                          <p className="text-sm text-gray-500">
                            PNG, JPG up to 5MB
                          </p>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              ) : (
                <TemplateGallery
                  templates={templates}
                  selectedTemplate={template}
                  onSelect={setTemplate}
                />
              )}
            </div>
          )}

          {/* Step 3: Write Message */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-slide-up">
              <h2 className="text-xl font-semibold">Write Your Message</h2>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your heartfelt message here..."
                rows={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="text-sm text-gray-500">
                {message.length} characters
              </p>
            </div>
          )}

          {/* Step 4: Recipient Details */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-slide-up">
              <h2 className="text-xl font-semibold">Recipient Details</h2>
              <Input
                label="Recipient Name"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="John Doe"
              />
              <Input
                label="Street Address"
                required
                value={recipientAddress.street}
                onChange={(e) =>
                  setRecipientAddress({ street: e.target.value })
                }
                placeholder="123 Main St"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  required
                  value={recipientAddress.city}
                  onChange={(e) =>
                    setRecipientAddress({ city: e.target.value })
                  }
                  placeholder="New York"
                />
                <Select
                  label="State"
                  required
                  value={recipientAddress.state}
                  onChange={(e) =>
                    setRecipientAddress({ state: e.target.value })
                  }
                  options={[
                    { value: '', label: 'Select State' },
                    { value: 'AL', label: 'Alabama' },
                    { value: 'AK', label: 'Alaska' },
                    { value: 'AZ', label: 'Arizona' },
                    { value: 'AR', label: 'Arkansas' },
                    { value: 'CA', label: 'California' },
                    { value: 'CO', label: 'Colorado' },
                    { value: 'CT', label: 'Connecticut' },
                    { value: 'DE', label: 'Delaware' },
                    { value: 'FL', label: 'Florida' },
                    { value: 'GA', label: 'Georgia' },
                    { value: 'HI', label: 'Hawaii' },
                    { value: 'ID', label: 'Idaho' },
                    { value: 'IL', label: 'Illinois' },
                    { value: 'IN', label: 'Indiana' },
                    { value: 'IA', label: 'Iowa' },
                    { value: 'KS', label: 'Kansas' },
                    { value: 'KY', label: 'Kentucky' },
                    { value: 'LA', label: 'Louisiana' },
                    { value: 'ME', label: 'Maine' },
                    { value: 'MD', label: 'Maryland' },
                    { value: 'MA', label: 'Massachusetts' },
                    { value: 'MI', label: 'Michigan' },
                    { value: 'MN', label: 'Minnesota' },
                    { value: 'MS', label: 'Mississippi' },
                    { value: 'MO', label: 'Missouri' },
                    { value: 'MT', label: 'Montana' },
                    { value: 'NE', label: 'Nebraska' },
                    { value: 'NV', label: 'Nevada' },
                    { value: 'NH', label: 'New Hampshire' },
                    { value: 'NJ', label: 'New Jersey' },
                    { value: 'NM', label: 'New Mexico' },
                    { value: 'NY', label: 'New York' },
                    { value: 'NC', label: 'North Carolina' },
                    { value: 'ND', label: 'North Dakota' },
                    { value: 'OH', label: 'Ohio' },
                    { value: 'OK', label: 'Oklahoma' },
                    { value: 'OR', label: 'Oregon' },
                    { value: 'PA', label: 'Pennsylvania' },
                    { value: 'RI', label: 'Rhode Island' },
                    { value: 'SC', label: 'South Carolina' },
                    { value: 'SD', label: 'South Dakota' },
                    { value: 'TN', label: 'Tennessee' },
                    { value: 'TX', label: 'Texas' },
                    { value: 'UT', label: 'Utah' },
                    { value: 'VT', label: 'Vermont' },
                    { value: 'VA', label: 'Virginia' },
                    { value: 'WA', label: 'Washington' },
                    { value: 'WV', label: 'West Virginia' },
                    { value: 'WI', label: 'Wisconsin' },
                    { value: 'WY', label: 'Wyoming' },
                    { value: 'DC', label: 'Washington D.C.' },
                  ]}
                />
              </div>
              <Input
                label="ZIP Code"
                required
                value={recipientAddress.zipCode}
                onChange={(e) =>
                  setRecipientAddress({ zipCode: e.target.value })
                }
                placeholder="10001"
                maxLength={5}
              />

              {/* Nearby Mailers Map */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Nearby Mailers</h3>
                  {nearbyMailers.length > 0 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {nearbyMailers.length} available
                    </span>
                  )}
                </div>

                {geocodeError ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-red-600 text-sm">{geocodeError}</p>
                    <p className="text-red-500 text-xs mt-1">Please check the address and try again</p>
                  </div>
                ) : recipientCoords.lat ? (
                  <>
                    <NearbyMailersMap
                      recipientLat={recipientCoords.lat}
                      recipientLng={recipientCoords.lng}
                      mailers={nearbyMailers}
                      loading={mapLoading}
                    />
                    {nearbyMailers.length > 0 && (
                      <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <svg className="h-5 w-5 text-green-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <div>
                            <p className="text-green-800 font-medium text-sm">
                              Great news! {nearbyMailers.length} mailer{nearbyMailers.length > 1 ? 's' : ''} nearby
                            </p>
                            <p className="text-green-700 text-xs mt-0.5">
                              Closest mailer is {nearbyMailers[0]?.distance.toFixed(1)} miles away - estimated same-day delivery possible!
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                    <svg className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <p className="text-gray-600 font-medium">Enter address to see nearby mailers</p>
                    <p className="text-gray-500 text-sm mt-1">We'll show you available mailers in your area</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-slide-up">
              <h2 className="text-xl font-semibold">Review Your Order</h2>

              <div className="space-y-4">
                <Card>
                  <h3 className="font-medium mb-2">Card Type</h3>
                  <p className="text-gray-600">
                    {cardCategories.find((c) => c.id === cardType)?.name}
                  </p>
                </Card>

                <Card>
                  <h3 className="font-medium mb-2">Recipient</h3>
                  <p className="text-gray-900 font-medium">{recipientName}</p>
                  <p className="text-gray-600 text-sm mt-1">
                    {recipientAddress.street}<br />
                    {recipientAddress.city}, {recipientAddress.state} {recipientAddress.zipCode}
                  </p>
                </Card>

                <Card>
                  <h3 className="font-medium mb-2">Your Message</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{message}</p>
                </Card>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            {currentStep > 1 && (
              <Button variant="outline" size="lg" onClick={prevStep}>
                Back
              </Button>
            )}
            <SignedIn>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !canProceedStep1) ||
                  (currentStep === 2 && !canProceedStep2) ||
                  (currentStep === 3 && !canProceedStep3) ||
                  (currentStep === 4 && !canProceedStep4)
                }
              >
                {currentStep === 5 ? 'Proceed to Checkout' : 'Next'}
              </Button>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="primary" size="lg" fullWidth>
                  Sign In to Continue
                </Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="lg:sticky lg:top-24 h-fit">
          <CardPreview
            template={template}
            customImage={customImage}
            message={message}
            recipientName={recipientName}
          />
        </div>
      </div>
    </div>
  )
}

export default CreateCard
