import logger from '../utils/logger.js';

/**
 * Geocoding service using OpenStreetMap Nominatim API
 * Free and open-source alternative to Google Maps API
 */

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

/**
 * Geocode an address to get latitude and longitude
 * @param {string} address - Street address
 * @param {string} city - City
 * @param {string} state - State code
 * @param {string} zip - ZIP code
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export async function geocodeAddress(address, city, state, zip) {
  try {
    const query = `${address}, ${city}, ${state} ${zip}, USA`;
    const url = `${NOMINATIM_BASE_URL}/search?q=${encodeURIComponent(query)}&format=json&limit=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MailIt App (contact@mailit.com)' // Required by Nominatim
      }
    });

    if (!response.ok) {
      throw new Error(`Geocoding API returned ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      throw new Error('Address not found');
    }

    const result = data[0];

    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon)
    };
  } catch (error) {
    logger.error('Geocoding error:', error);
    throw new Error(`Failed to geocode address: ${error.message}`);
  }
}

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @returns {number} Distance in miles
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 3958.8; // Earth's radius in miles

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;

  return parseFloat(distance.toFixed(2));
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Find active mailers within a given radius
 * @param {PrismaClient} prisma - Prisma client instance
 * @param {number} lat - Center latitude
 * @param {number} lng - Center longitude
 * @param {number} radiusMiles - Search radius in miles
 * @returns {Promise<Array>} Array of mailer profiles within radius
 */
export async function findMailersInRadius(prisma, lat, lng, radiusMiles) {
  try {
    // Get all active mailers
    // Note: In production, you'd want to use a spatial database query (PostGIS)
    // For now, we fetch all and filter in-memory
    const mailers = await prisma.mailerProfile.findMany({
      where: {
        isActive: true,
        stripeOnboarded: true // Only mailers who completed Stripe onboarding
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Filter by distance
    const mailersInRadius = mailers
      .map(mailer => ({
        ...mailer,
        distance: calculateDistance(lat, lng, mailer.latitude, mailer.longitude)
      }))
      .filter(mailer => mailer.distance <= radiusMiles)
      .sort((a, b) => a.distance - b.distance); // Sort by distance

    return mailersInRadius;
  } catch (error) {
    logger.error('Error finding mailers in radius:', error);
    throw error;
  }
}

/**
 * Check if a point is within a mailer's service area
 * @param {number} mailerLat - Mailer's latitude
 * @param {number} mailerLng - Mailer's longitude
 * @param {number} mailerRadius - Mailer's service radius in miles
 * @param {number} targetLat - Target latitude
 * @param {number} targetLng - Target longitude
 * @returns {boolean} True if target is within mailer's service area
 */
export function isWithinServiceArea(mailerLat, mailerLng, mailerRadius, targetLat, targetLng) {
  const distance = calculateDistance(mailerLat, mailerLng, targetLat, targetLng);
  return distance <= mailerRadius;
}
