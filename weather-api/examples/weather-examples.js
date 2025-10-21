/**
 * Weather API Usage Examples
 * 
 * This file demonstrates how to use the Weather API endpoints
 * Run this script after starting the server: node examples/weather-examples.js
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/weather';

// Helper function to make API requests
async function makeRequest(endpoint, params = {}) {
  try {
    const response = await axios.get(`${API_BASE_URL}${endpoint}`, { params });
    console.log(`\n✅ ${endpoint}:`);
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error(`\n❌ ${endpoint} Error:`, error.response?.data || error.message);
  }
}

async function runExamples() {
  console.log('🌤️  Weather API Examples\n');
  console.log('Make sure the server is running on http://localhost:3000\n');

  // Example 1: Current weather by coordinates (New York)
  console.log('📍 Example 1: Current weather by coordinates (New York)');
  await makeRequest('/current', {
    lat: 40.7128,
    lon: -74.0060,
    units: 'metric'
  });

  // Example 2: Current weather by city name
  console.log('\n🏙️  Example 2: Current weather by city name (London)');
  await makeRequest('/current', {
    city: 'London',
    country: 'GB',
    units: 'metric'
  });

  // Example 3: Current weather in imperial units
  console.log('\n🌡️  Example 3: Current weather in imperial units (Tokyo)');
  await makeRequest('/current', {
    city: 'Tokyo',
    units: 'imperial'
  });

  // Example 4: 3-day forecast by coordinates
  console.log('\n📅 Example 4: 3-day forecast by coordinates (Paris)');
  await makeRequest('/forecast', {
    lat: 48.8566,
    lon: 2.3522,
    days: 3,
    units: 'metric'
  });

  // Example 5: 7-day forecast by city
  console.log('\n🌍 Example 5: 7-day forecast by city (Sydney)');
  await makeRequest('/forecast', {
    city: 'Sydney',
    country: 'AU',
    days: 7,
    units: 'metric'
  });

  // Example 6: Health check
  console.log('\n💚 Example 6: Health check');
  await makeRequest('/health');

  // Example 7: Error handling - invalid coordinates
  console.log('\n⚠️  Example 7: Error handling - invalid coordinates');
  await makeRequest('/current', {
    lat: 999,
    lon: 999,
    units: 'metric'
  });

  // Example 8: Error handling - missing parameters
  console.log('\n⚠️  Example 8: Error handling - missing parameters');
  await makeRequest('/current', {
    units: 'metric'
  });

  console.log('\n✨ Examples completed!');
}

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples().catch(console.error);
}

export { runExamples };
