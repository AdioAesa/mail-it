# Leaflet Map Setup Guide

## Installation Instructions

To use the `NearbyMailersMap` component, you need to install the required npm packages:

```bash
cd /home/ahdemirci/nearrun/frontend
npm install react-leaflet leaflet
```

## Package Versions

The following packages will be installed:
- **react-leaflet**: ^4.2.1 (React wrapper for Leaflet.js)
- **leaflet**: ^1.9.4 (Open-source JavaScript library for interactive maps)

## Quick Start

After installation, you can import and use the component:

```jsx
import NearbyMailersMap from './components/maps/NearbyMailersMap'

// In your component
<NearbyMailersMap
  recipientLat={40.7128}
  recipientLng={-74.0060}
  mailers={mailersArray}
  loading={false}
/>
```

## Files Created

1. **Component**: `/home/ahdemirci/nearrun/frontend/src/components/maps/NearbyMailersMap.jsx`
   - Main map component with all functionality

2. **Example**: `/home/ahdemirci/nearrun/frontend/src/components/maps/NearbyMailersMap.example.jsx`
   - Example usage demonstrating different states

3. **Documentation**: `/home/ahdemirci/nearrun/frontend/src/components/maps/README.md`
   - Complete API documentation and usage guide

4. **Index**: `/home/ahdemirci/nearrun/frontend/src/components/maps/index.js`
   - Barrel export for cleaner imports

## Alternative Import (using barrel export)

```jsx
import { NearbyMailersMap } from './components/maps'
```

## No API Key Required

This component uses OpenStreetMap tiles which are free and don't require an API key. However, please be aware of the [OpenStreetMap Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/).

## Troubleshooting

### Map not displaying

If the map doesn't display properly, make sure you've imported the Leaflet CSS:

```jsx
import 'leaflet/dist/leaflet.css'
```

This is already included in the component, but if you encounter styling issues, check that your bundler (Vite) is properly handling CSS imports.

### Marker icons not showing

The component uses custom div-based markers with Tailwind CSS classes. Ensure Tailwind is properly configured and the custom colors (`burgundy-*`, `postal-*`, `ink-*`) are available in your theme.

### TypeScript Support

If using TypeScript, you may need to install type definitions:

```bash
npm install --save-dev @types/leaflet
```

## Performance Considerations

- The map uses scroll wheel zoom disabled by default to improve mobile UX
- Markers auto-cluster when there are many nearby mailers (future enhancement)
- Map tiles are cached by the browser for better performance

## Next Steps

1. Install the dependencies: `npm install react-leaflet leaflet`
2. Test the component using the example file
3. Integrate into your mailer discovery/selection flow
4. Customize marker styles and popup content as needed
