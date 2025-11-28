import { geocodeAddress, calculateDistance } from '../src/services/geocoding.js';

/**
 * Test script for geocoding service
 * Run with: node scripts/test-geocoding.js
 */

async function testGeocoding() {
  console.log('Testing geocoding service...\n');

  const testAddresses = [
    {
      address: '1600 Amphitheatre Parkway',
      city: 'Mountain View',
      state: 'CA',
      zip: '94043',
      name: 'Google HQ'
    },
    {
      address: '1 Apple Park Way',
      city: 'Cupertino',
      state: 'CA',
      zip: '95014',
      name: 'Apple Park'
    },
    {
      address: '410 Terry Ave N',
      city: 'Seattle',
      state: 'WA',
      zip: '98109',
      name: 'Amazon HQ'
    }
  ];

  const results = [];

  for (const addr of testAddresses) {
    try {
      console.log(`Geocoding: ${addr.name}`);
      console.log(`  ${addr.address}, ${addr.city}, ${addr.state} ${addr.zip}`);

      const coords = await geocodeAddress(addr.address, addr.city, addr.state, addr.zip);

      console.log(`  ✓ Latitude: ${coords.latitude}`);
      console.log(`  ✓ Longitude: ${coords.longitude}\n`);

      results.push({
        ...addr,
        ...coords
      });
    } catch (error) {
      console.error(`  ✗ Error: ${error.message}\n`);
    }
  }

  // Test distance calculation
  if (results.length >= 2) {
    console.log('Testing distance calculation...\n');

    const distance = calculateDistance(
      results[0].latitude,
      results[0].longitude,
      results[1].latitude,
      results[1].longitude
    );

    console.log(`Distance from ${results[0].name} to ${results[1].name}:`);
    console.log(`  ${distance} miles\n`);
  }
}

testGeocoding();
