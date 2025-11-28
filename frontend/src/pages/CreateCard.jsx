import { useNavigate } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react'
import { useState, useRef } from 'react'
import useOrderStore from '../store/orderStore'
import { cardCategories, getTemplatesByCategory } from '../data/cardTemplates'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import TemplateGallery from '../components/cards/TemplateGallery'
import CardPreview from '../components/cards/CardPreview'

const CreateCard = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [customImagePreview, setCustomImagePreview] = useState(null)

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
                    { value: 'NY', label: 'New York' },
                    { value: 'CA', label: 'California' },
                    { value: 'TX', label: 'Texas' },
                    { value: 'FL', label: 'Florida' },
                    // Add more states as needed
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
