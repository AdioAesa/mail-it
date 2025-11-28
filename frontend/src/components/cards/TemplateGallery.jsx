import Card from '../ui/Card'

/**
 * Template gallery component
 * Displays grid of card templates for selection
 */
const TemplateGallery = ({ templates, selectedTemplate, onSelect }) => {
  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No templates available for this category</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {templates.map((template) => (
        <Card
          key={template.id}
          padding="none"
          clickable
          hover
          className={`overflow-hidden transition-all ${
            selectedTemplate?.id === template.id
              ? 'ring-2 ring-primary-500 shadow-soft-lg'
              : ''
          }`}
          onClick={() => onSelect(template)}
        >
          <div className="aspect-[2/3] relative bg-gray-100">
            <img
              src={template.imageUrl}
              alt={template.name}
              className="w-full h-full object-cover"
            />
            {selectedTemplate?.id === template.id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
          <div className="p-3">
            <h4 className="font-medium text-sm text-gray-900 truncate">
              {template.name}
            </h4>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {template.description}
            </p>
          </div>
        </Card>
      ))}
    </div>
  )
}

export default TemplateGallery
