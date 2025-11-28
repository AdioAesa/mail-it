/**
 * Geocoding Integration
 * Uses OpenStreetMap Nominatim (free, no API key required)
 * Rate limit: 1 request per second
 */

const fetch = require('node-fetch');
const config = require('../config');
const distance = require('./distance');

let lastRequestTime = 0;

/**
 * Rate limiter to respect Nominatim's 1 req/sec limit
 */
async function rateLimit() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < config.geocoding.rateLimit) {
    const delay = config.geocoding.rateLimit - timeSinceLastRequest;
    console.log(`Rate limiting: waiting ${delay}ms...`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  lastRequestTime = Date.now();
}

/**
 * Make request to Nominatim API
 */
async function nominatimRequest(url) {
  await rateLimit();

  const response = await fetch(url, {
    headers: {
      'User-Agent': config.geocoding.userAgent
    }
  });

  if (!response.ok) {
    throw new Error(`Nominatim API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Geocode an address to get lat/lng coordinates
 * @param {string} address - Street address
 * @param {string} city - City name
 * @param {string} state - State code (e.g., 'CA')
 * @param {string} zip - ZIP code
 * @returns {Promise<Object>} Geocoding result with lat/lng
 */
async function geocodeAddress(address, city, state, zip) {
  console.log(`Geocoding address: ${address}, ${city}, ${state} ${zip}`);

  if (config.mockMode) {
    return {
      lat: 37.7749,
      lng: -122.4194,
      formattedAddress: `${address}, ${city}, ${state} ${zip}`,
      confidence: 0.9,
      source: 'mock'
    };
  }

  try {
    // Build query string
    const queryParts = [];
    if (address) queryParts.push(address);
    if (city) queryParts.push(city);
    if (state) queryParts.push(state);
    if (zip) queryParts.push(zip);

    const query = queryParts.join(', ');
    const url = `${config.geocoding.nominatimUrl}/search?` +
      `q=${encodeURIComponent(query)}` +
      `&format=json` +
      `&limit=1` +
      `&addressdetails=1` +
      `&countrycodes=us`;

    const results = await nominatimRequest(url);

    if (!results || results.length === 0) {
      throw new Error('Address not found');
    }

    const result = results[0];

    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      formattedAddress: result.display_name,
      confidence: parseFloat(result.importance || 0.5),
      addressDetails: {
        houseNumber: result.address?.house_number,
        road: result.address?.road,
        city: result.address?.city || result.address?.town,
        state: result.address?.state,
        postcode: result.address?.postcode,
        country: result.address?.country
      },
      source: 'nominatim'
    };
  } catch (error) {
    console.error('Geocoding error:', error.message);
    throw new Error(`Failed to geocode address: ${error.message}`);
  }
}

/**
 * Reverse geocode - get address from coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} Address details
 */
async function reverseGeocode(lat, lng) {
  console.log(`Reverse geocoding: ${lat}, ${lng}`);

  if (config.mockMode) {
    return {
      address: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94102',
      formattedAddress: '123 Main St, San Francisco, CA 94102',
      source: 'mock'
    };
  }

  try {
    const url = `${config.geocoding.nominatimUrl}/reverse?` +
      `lat=${lat}` +
      `&lon=${lng}` +
      `&format=json` +
      `&addressdetails=1`;

    const result = await nominatimRequest(url);

    if (!result || !result.address) {
      throw new Error('Location not found');
    }

    return {
      address: result.address.house_number && result.address.road
        ? `${result.address.house_number} ${result.address.road}`
        : result.address.road || '',
      city: result.address.city || result.address.town || result.address.village,
      state: result.address.state,
      zip: result.address.postcode,
      county: result.address.county,
      country: result.address.country,
      formattedAddress: result.display_name,
      addressDetails: result.address,
      source: 'nominatim'
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error.message);
    throw new Error(`Failed to reverse geocode: ${error.message}`);
  }
}

/**
 * Validate if an address is deliverable
 * @param {string} address - Street address
 * @param {string} city - City name
 * @param {string} state - State code
 * @param {string} zip - ZIP code
 * @returns {Promise<Object>} Validation result
 */
async function validateAddress(address, city, state, zip) {
  console.log(`Validating address: ${address}, ${city}, ${state} ${zip}`);

  if (config.mockMode) {
    return {
      valid: true,
      normalized: {
        address: address,
        city: city,
        state: state,
        zip: zip
      },
      coordinates: {
        lat: 37.7749,
        lng: -122.4194
      }
    };
  }

  try {
    const result = await geocodeAddress(address, city, state, zip);

    // Check if we got a valid result
    const valid = result.confidence > 0.3 && result.addressDetails?.postcode;

    return {
      valid,
      normalized: {
        address: result.addressDetails?.houseNumber && result.addressDetails?.road
          ? `${result.addressDetails.houseNumber} ${result.addressDetails.road}`
          : address,
        city: result.addressDetails?.city || city,
        state: result.addressDetails?.state || state,
        zip: result.addressDetails?.postcode || zip
      },
      coordinates: {
        lat: result.lat,
        lng: result.lng
      },
      confidence: result.confidence,
      formattedAddress: result.formattedAddress
    };
  } catch (error) {
    console.error('Address validation error:', error.message);
    return {
      valid: false,
      error: error.message
    };
  }
}

/**
 * Find nearby mailers within a radius
 * @param {number} lat - Delivery location latitude
 * @param {number} lng - Delivery location longitude
 * @param {Array<Object>} mailers - Array of mailer objects with lat/lng
 * @param {number} radiusMiles - Search radius in miles
 * @returns {Array<Object>} Mailers within radius, sorted by distance
 */
function findNearbyMailers(lat, lng, mailers, radiusMiles = config.geocoding.defaultRadius) {
  console.log(`Finding mailers within ${radiusMiles} miles of ${lat}, ${lng}`);

  return distance.filterByRadius(lat, lng, mailers, radiusMiles);
}

/**
 * Get closest mailer to a location
 * @param {number} lat - Delivery location latitude
 * @param {number} lng - Delivery location longitude
 * @param {Array<Object>} mailers - Array of mailer objects with lat/lng
 * @returns {Object|null} Closest mailer with distance
 */
function getClosestMailer(lat, lng, mailers) {
  console.log(`Finding closest mailer to ${lat}, ${lng}`);

  return distance.findNearest(lat, lng, mailers);
}

/**
 * Batch geocode multiple addresses
 * @param {Array<Object>} addresses - Array of address objects
 * @returns {Promise<Array<Object>>} Geocoded results
 */
async function batchGeocode(addresses) {
  console.log(`Batch geocoding ${addresses.length} addresses...`);

  const results = [];

  for (const addr of addresses) {
    try {
      const result = await geocodeAddress(
        addr.address,
        addr.city,
        addr.state,
        addr.zip
      );
      results.push({ ...addr, ...result, success: true });
    } catch (error) {
      results.push({ ...addr, success: false, error: error.message });
    }
  }

  return results;
}

module.exports = {
  geocodeAddress,
  reverseGeocode,
  validateAddress,
  findNearbyMailers,
  getClosestMailer,
  batchGeocode,
  distance
};
