import Card from '../ui/Card'

/**
 * Card preview component
 * Shows a preview of the card with the user's message
 */
const CardPreview = ({ template, customImage, message, recipientName }) => {
  const imageUrl = customImage || template?.imageUrl

  return (
    <Card className="max-w-sm mx-auto">
      <div className="space-y-4">
        {/* Card Front */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Card Front</h3>
          <div className="aspect-[2/3] bg-gray-100 rounded-lg overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Card design"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg
                  className="w-16 h-16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Card Message */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Your Message</h3>
          <div className="bg-gray-50 rounded-lg p-4 min-h-[120px]">
            {recipientName && (
              <p className="font-medium text-gray-900 mb-2">Dear {recipientName},</p>
            )}
            {message ? (
              <p className="text-gray-700 whitespace-pre-wrap">{message}</p>
            ) : (
              <p className="text-gray-400 italic">Your message will appear here...</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default CardPreview
