import { useState } from 'react'
import NearbyMailersMap from './NearbyMailersMap'

/**
 * Example usage of NearbyMailersMap component
 * This demonstrates different states and scenarios
 */
const NearbyMailersMapExample = () => {
  const [loading, setLoading] = useState(false)

  // Example: New York City delivery
  const recipientLocation = {
    lat: 40.7128,
    lng: -74.0060
  }

  // Example: Nearby mailers in NYC area
  const exampleMailers = [
    {
      id: '1',
      firstName: 'Sarah',
      distance: 0.8,
      rating: 4.8,
      lat: 40.7228,
      lng: -74.0060
    },
    {
      id: '2',
      firstName: 'Mike',
      distance: 1.2,
      rating: 4.9,
      lat: 40.7128,
      lng: -74.0160
    },
    {
      id: '3',
      firstName: 'Jessica',
      distance: 0.5,
      rating: 5.0,
      lat: 40.7078,
      lng: -74.0120
    },
    {
      id: '4',
      firstName: 'David',
      distance: 1.5,
      rating: 4.7,
      lat: 40.7028,
      lng: -73.9960
    }
  ]

  const simulateLoading = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl text-ink-black mb-2">
          NearbyMailersMap Examples
        </h1>
        <p className="font-sans text-ink-medium">
          Interactive map component demonstrations
        </p>
      </div>

      {/* Example 1: Normal state with mailers */}
      <section>
        <h2 className="font-sans text-xl font-semibold text-ink-black mb-3">
          With Nearby Mailers
        </h2>
        <NearbyMailersMap
          recipientLat={recipientLocation.lat}
          recipientLng={recipientLocation.lng}
          mailers={exampleMailers}
          loading={false}
        />
        <p className="font-sans text-sm text-ink-medium mt-2">
          Shows recipient location (red marker) and {exampleMailers.length} nearby mailers (blue markers)
        </p>
      </section>

      {/* Example 2: Loading state */}
      <section>
        <h2 className="font-sans text-xl font-semibold text-ink-black mb-3">
          Loading State
        </h2>
        <div className="space-y-2">
          <NearbyMailersMap
            recipientLat={recipientLocation.lat}
            recipientLng={recipientLocation.lng}
            mailers={exampleMailers}
            loading={loading}
          />
          <button
            onClick={simulateLoading}
            className="px-4 py-2 bg-postal-600 text-white rounded-lg font-sans text-sm hover:bg-postal-700 transition-colors"
          >
            Simulate Loading
          </button>
        </div>
        <p className="font-sans text-sm text-ink-medium mt-2">
          Displays loading overlay while fetching data
        </p>
      </section>

      {/* Example 3: Empty state (no mailers) */}
      <section>
        <h2 className="font-sans text-xl font-semibold text-ink-black mb-3">
          No Mailers Nearby
        </h2>
        <NearbyMailersMap
          recipientLat={recipientLocation.lat}
          recipientLng={recipientLocation.lng}
          mailers={[]}
          loading={false}
        />
        <p className="font-sans text-sm text-ink-medium mt-2">
          Shows empty state message when no mailers are available
        </p>
      </section>

      {/* Example 4: Single mailer */}
      <section>
        <h2 className="font-sans text-xl font-semibold text-ink-black mb-3">
          Single Mailer
        </h2>
        <NearbyMailersMap
          recipientLat={recipientLocation.lat}
          recipientLng={recipientLocation.lng}
          mailers={[exampleMailers[0]]}
          loading={false}
        />
        <p className="font-sans text-sm text-ink-medium mt-2">
          Map auto-fits bounds to show both recipient and the single mailer
        </p>
      </section>

      {/* Code example */}
      <section className="bg-cream-100 rounded-xl p-6">
        <h2 className="font-sans text-xl font-semibold text-ink-black mb-3">
          Usage Code
        </h2>
        <pre className="bg-white rounded-lg p-4 overflow-x-auto text-xs font-mono">
{`import NearbyMailersMap from './components/maps/NearbyMailersMap'

<NearbyMailersMap
  recipientLat={40.7128}
  recipientLng={-74.0060}
  mailers={[
    {
      id: '1',
      firstName: 'Sarah',
      distance: 0.8,
      rating: 4.8,
      lat: 40.7228,
      lng: -74.0060
    }
  ]}
  loading={false}
/>`}
        </pre>
      </section>
    </div>
  )
}

export default NearbyMailersMapExample
