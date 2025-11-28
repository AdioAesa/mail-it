/**
 * Distance Calculations
 * Haversine formula and proximity utilities
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - First point latitude
 * @param {number} lng1 - First point longitude
 * @param {number} lat2 - Second point latitude
 * @param {number} lng2 - Second point longitude
 * @param {string} unit - Unit of measurement ('miles' or 'km')
 * @returns {number} Distance in specified unit
 */
function calculateDistance(lat1, lng1, lat2, lng2, unit = 'miles') {
  const R = unit === 'km' ? 6371 : 3959; // Earth's radius (km or miles)

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Degrees
 * @returns {number} Radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Check if a point is within a radius of a center point
 * @param {number} centerLat - Center point latitude
 * @param {number} centerLng - Center point longitude
 * @param {number} pointLat - Test point latitude
 * @param {number} pointLng - Test point longitude
 * @param {number} radiusMiles - Radius in miles
 * @returns {boolean} True if point is within radius
 */
function isWithinRadius(centerLat, centerLng, pointLat, pointLng, radiusMiles) {
  const distance = calculateDistance(centerLat, centerLng, pointLat, pointLng, 'miles');
  return distance <= radiusMiles;
}

/**
 * Sort locations by distance from a center point
 * @param {number} centerLat - Center point latitude
 * @param {number} centerLng - Center point longitude
 * @param {Array<Object>} points - Array of points with lat/lng properties
 * @param {number} maxResults - Maximum number of results (optional)
 * @returns {Array<Object>} Sorted array with distance property added
 */
function sortByDistance(centerLat, centerLng, points, maxResults = null) {
  const pointsWithDistance = points.map(point => ({
    ...point,
    distance: calculateDistance(centerLat, centerLng, point.lat, point.lng, 'miles')
  }));

  const sorted = pointsWithDistance.sort((a, b) => a.distance - b.distance);

  return maxResults ? sorted.slice(0, maxResults) : sorted;
}

/**
 * Filter locations within a radius
 * @param {number} centerLat - Center point latitude
 * @param {number} centerLng - Center point longitude
 * @param {Array<Object>} points - Array of points with lat/lng properties
 * @param {number} radiusMiles - Radius in miles
 * @returns {Array<Object>} Filtered array with distance property added
 */
function filterByRadius(centerLat, centerLng, points, radiusMiles) {
  return points
    .map(point => ({
      ...point,
      distance: calculateDistance(centerLat, centerLng, point.lat, point.lng, 'miles')
    }))
    .filter(point => point.distance <= radiusMiles)
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Find the nearest point to a center point
 * @param {number} centerLat - Center point latitude
 * @param {number} centerLng - Center point longitude
 * @param {Array<Object>} points - Array of points with lat/lng properties
 * @returns {Object|null} Nearest point with distance property or null if no points
 */
function findNearest(centerLat, centerLng, points) {
  if (!points || points.length === 0) {
    return null;
  }

  const sorted = sortByDistance(centerLat, centerLng, points, 1);
  return sorted[0];
}

/**
 * Calculate bounding box for a radius around a point
 * Used for database queries to filter results before distance calculation
 * @param {number} lat - Center latitude
 * @param {number} lng - Center longitude
 * @param {number} radiusMiles - Radius in miles
 * @returns {Object} Bounding box with min/max lat/lng
 */
function getBoundingBox(lat, lng, radiusMiles) {
  const latChange = radiusMiles / 69; // 1 degree latitude ≈ 69 miles
  const lngChange = radiusMiles / (Math.cos(toRadians(lat)) * 69);

  return {
    minLat: lat - latChange,
    maxLat: lat + latChange,
    minLng: lng - lngChange,
    maxLng: lng + lngChange
  };
}

/**
 * Calculate bearing between two points (direction in degrees)
 * @param {number} lat1 - First point latitude
 * @param {number} lng1 - First point longitude
 * @param {number} lat2 - Second point latitude
 * @param {number} lng2 - Second point longitude
 * @returns {number} Bearing in degrees (0-360)
 */
function calculateBearing(lat1, lng1, lat2, lng2) {
  const dLng = toRadians(lng2 - lng1);
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);

  const y = Math.sin(dLng) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);

  const bearing = Math.atan2(y, x);
  const degrees = bearing * (180 / Math.PI);

  return (degrees + 360) % 360; // Normalize to 0-360
}

/**
 * Get compass direction from bearing
 * @param {number} bearing - Bearing in degrees
 * @returns {string} Compass direction (N, NE, E, SE, S, SW, W, NW)
 */
function getCompassDirection(bearing) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
}

module.exports = {
  calculateDistance,
  isWithinRadius,
  sortByDistance,
  filterByRadius,
  findNearest,
  getBoundingBox,
  calculateBearing,
  getCompassDirection,
  toRadians
};
