import { useState, useRef } from 'react'
import Button from '../ui/Button'
import Card from '../ui/Card'

/**
 * Delivery proof upload component
 * Allows mailers to upload photo proof of delivery
 */
const DeliveryProof = ({ onUpload, existingProof }) => {
  const [preview, setPreview] = useState(existingProof || null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!fileInputRef.current?.files[0]) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('proof', fileInputRef.current.files[0])
      await onUpload(formData)
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload proof. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card>
      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-gray-900 mb-1">Delivery Proof</h3>
          <p className="text-sm text-gray-600">
            Upload a photo showing the card was delivered to the recipient
          </p>
        </div>

        {/* Preview */}
        {preview ? (
          <div className="space-y-3">
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={preview}
                alt="Delivery proof"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex gap-2">
              {!existingProof && (
                <>
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    loading={uploading}
                    onClick={handleUpload}
                  >
                    Upload Photo
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={handleRemove}
                    disabled={uploading}
                  >
                    Remove
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
              id="proof-upload"
            />
            <label
              htmlFor="proof-upload"
              className="block w-full cursor-pointer"
            >
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
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
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <p className="text-gray-600 font-medium mb-1">
                  Take or upload a photo
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG up to 5MB
                </p>
              </div>
            </label>
          </div>
        )}
      </div>
    </Card>
  )
}

export default DeliveryProof
