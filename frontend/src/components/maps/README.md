# NearbyMailersMap Component

A React component that displays an interactive map showing the recipient's delivery location and nearby mailers using Leaflet.js.

## Installation

Install the required dependencies:

```bash
cd /home/ahdemirci/mailit/frontend
npm install react-leaflet leaflet
```

## Usage

```jsx
import NearbyMailersMap from './components/maps/NearbyMailersMap'

function MyComponent() {
  const mailers = [
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
    }
  ]

  return (
    <NearbyMailersMap
      recipientLat={40.7128}
      recipientLng={-74.0060}
      mailers={mailers}
      loading={false}
    />
  )
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `recipientLat` | number | Yes | - | Latitude of the recipient's delivery location |
| `recipientLng` | number | Yes | - | Longitude of the recipient's delivery location |
| `mailers` | Array | No | `[]` | Array of mailer objects (see structure below) |
| `loading` | boolean | No | `false` | Shows loading overlay when true |

### Mailer Object Structure

```javascript
{
  id: string,          // Unique identifier
  firstName: string,   // Mailer's first name
  distance: number,    // Distance from recipient in miles
  rating: number,      // Mailer rating (0-5)
  lat: number,         // Mailer latitude
  lng: number          // Mailer longitude
}
```

## Features

- **Responsive Design**: Adapts to mobile (300px) and desktop (400px) heights
- **Custom Markers**:
  - Red marker for recipient location
  - Blue/postal markers for mailers
- **Interactive Popups**: Click markers to see details
- **Auto-fit Bounds**: Automatically zooms to show all markers
- **Loading State**: Displays loading overlay
- **Empty State**: Shows message when no mailers are nearby
- **Error Handling**: Validates coordinates and shows error for invalid data

## Styling

The component uses Tailwind CSS with custom colors from the mailit theme:
- `burgundy-600`: Recipient marker
- `postal-600`: Mailer markers
- `ink-*`: Text colors
- `shadow-soft`: Consistent shadows

## Map Controls

- **Zoom**: Zoom in/out buttons in top-left corner
- **Scroll Wheel**: Disabled by default (tap to enable)
- **Drag**: Pan the map by dragging
- **Markers**: Click to view popup details

## Notes

- Uses OpenStreetMap tiles (free, no API key required)
- Map tiles are loaded from `https://tile.openstreetmap.org`
- Markers are custom-designed using Tailwind CSS classes
- Component handles edge cases (no mailers, invalid coordinates, loading states)
