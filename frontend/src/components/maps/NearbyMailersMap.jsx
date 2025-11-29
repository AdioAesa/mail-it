import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

/**
 * Component to auto-fit map bounds to show all markers
 */
const AutoFitBounds = ({ recipientLat, recipientLng, mailers }) => {
  const map = useMap()

  useEffect(() => {
    if (mailers && mailers.length > 0) {
      const bounds = L.latLngBounds([
        [recipientLat, recipientLng],
        ...mailers.map(m => [m.lat, m.lng])
      ])
      map.fitBounds(bounds, { padding: [50, 50] })
    } else {
      // Just center on recipient if no mailers
      map.setView([recipientLat, recipientLng], 13)
    }
  }, [map, recipientLat, recipientLng, mailers])

  return null
}

/**
 * NearbyMailersMap - Interactive map showing recipient and nearby mailers
 *
 * @param {Object} props
 * @param {number} props.recipientLat - Recipient latitude
 * @param {number} props.recipientLng - Recipient longitude
 * @param {Array} props.mailers - Array of mailer objects with {id, firstName, distance, rating, lat, lng}
 * @param {boolean} props.loading - Loading state
 */
const NearbyMailersMap = ({
  recipientLat,
  recipientLng,
  mailers = [],
  loading = false
}) => {
  const mapRef = useRef(null)

  // Custom icon for recipient location (red marker)
  const recipientIcon = L.divIcon({
    className: 'custom-marker-icon',
    html: `
      <div class="relative">
        <div class="absolute -top-10 -left-4 flex flex-col items-center">
          <div class="bg-burgundy-600 rounded-full p-2 shadow-soft-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-burgundy-600 -mt-1"></div>
        </div>
      </div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40]
  })

  // Custom icon for mailer locations (blue/postal marker)
  const mailerIcon = (mailer) => L.divIcon({
    className: 'custom-marker-icon',
    html: `
      <div class="relative">
        <div class="absolute -top-10 -left-4 flex flex-col items-center">
          <div class="bg-postal-600 rounded-full p-2 shadow-soft-lg border-2 border-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
            </svg>
          </div>
          <div class="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-postal-600 -mt-1"></div>
        </div>
      </div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40]
  })

  // Don't render if coordinates are invalid
  if (!recipientLat || !recipientLng || isNaN(recipientLat) || isNaN(recipientLng)) {
    return (
      <div className="bg-white rounded-xl shadow-soft p-6 h-[300px] md:h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-ink-medium mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-ink-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <p className="text-ink-medium font-sans">Invalid location coordinates</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative bg-white rounded-xl shadow-soft overflow-hidden h-[300px] md:h-[400px]">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 z-[1000] flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-postal-600 border-r-transparent mb-2"></div>
            <p className="text-ink-medium font-sans text-sm">Loading map...</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && mailers.length === 0 && (
        <div className="absolute inset-0 pointer-events-none z-[500] flex items-center justify-center">
          <div className="bg-white/95 rounded-lg shadow-soft p-6 text-center max-w-xs">
            <div className="text-ink-medium mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-ink-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-ink-dark font-sans font-medium mb-1">No mailers nearby</p>
            <p className="text-ink-light font-sans text-sm">Try expanding your search radius</p>
          </div>
        </div>
      )}

      {/* Map container */}
      <MapContainer
        ref={mapRef}
        center={[recipientLat, recipientLng]}
        zoom={13}
        className="h-full w-full z-0"
        zoomControl={true}
        scrollWheelZoom={false}
      >
        {/* OpenStreetMap tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Auto-fit bounds to show all markers */}
        <AutoFitBounds
          recipientLat={recipientLat}
          recipientLng={recipientLng}
          mailers={mailers}
        />

        {/* Recipient marker */}
        <Marker
          position={[recipientLat, recipientLng]}
          icon={recipientIcon}
        >
          <Popup className="custom-popup">
            <div className="font-sans p-1">
              <p className="font-semibold text-burgundy-700 mb-1">Delivery Location</p>
              <p className="text-xs text-ink-medium">Your mail will be delivered here</p>
            </div>
          </Popup>
        </Marker>

        {/* Mailer markers */}
        {mailers.map((mailer) => (
          <Marker
            key={mailer.id}
            position={[mailer.lat, mailer.lng]}
            icon={mailerIcon(mailer)}
          >
            <Popup className="custom-popup">
              <div className="font-sans p-1 min-w-[180px]">
                <p className="font-semibold text-postal-700 mb-2">{mailer.firstName}</p>

                <div className="flex items-center gap-1 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gold-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-medium text-ink-dark">{mailer.rating.toFixed(1)}</span>
                </div>

                <div className="flex items-center gap-1 text-xs text-ink-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{mailer.distance.toFixed(1)} miles away</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Custom CSS for markers and popups */}
      <style>{`
        .custom-marker-icon {
          background: transparent;
          border: none;
        }

        .leaflet-popup-content-wrapper {
          border-radius: 0.75rem;
          box-shadow: 0 4px 16px rgba(28, 25, 23, 0.08);
        }

        .leaflet-popup-tip {
          box-shadow: 0 2px 8px rgba(28, 25, 23, 0.06);
        }

        .custom-popup .leaflet-popup-content {
          margin: 0;
        }
      `}</style>
    </div>
  )
}

export default NearbyMailersMap
