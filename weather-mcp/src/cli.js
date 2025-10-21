#!/usr/bin/env node

import { WeatherService } from './services/WeatherService.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const weatherService = new WeatherService();

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

async function main() {
  try {
    switch (command) {
      case 'current':
        await handleCurrentWeather(args);
        break;
      case 'forecast':
        await handleForecast(args);
        break;
      case 'health':
        await handleHealth();
        break;
      default:
        showHelp();
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

async function handleCurrentWeather(args) {
  const location = args[1];
  const country = args[2] || null;
  const units = args[3] || 'metric';

  if (!location) {
    console.error('Error: Location is required');
    console.log('Usage: npm run cli current <location> [country] [units]');
    process.exit(1);
  }

  const locationData = parseLocation(location);
  
  let weatherData;
  if (locationData.type === 'coordinates') {
    weatherData = await weatherService.getCurrentWeather(
      locationData.lat,
      locationData.lon,
      units
    );
  } else if (locationData.type === 'zipcode') {
    weatherData = await weatherService.getCurrentWeatherByZipcode(
      locationData.value,
      country,
      units
    );
  } else {
    weatherData = await weatherService.getCurrentWeatherByCity(
      locationData.value,
      country,
      units
    );
  }

  console.log(JSON.stringify(weatherData, null, 2));
}

async function handleForecast(args) {
  const location = args[1];
  const days = parseInt(args[2]) || 5;
  const country = args[3] || null;
  const units = args[4] || 'metric';

  if (!location) {
    console.error('Error: Location is required');
    console.log('Usage: npm run cli forecast <location> [days] [country] [units]');
    process.exit(1);
  }

  const locationData = parseLocation(location);
  
  let forecastData;
  if (locationData.type === 'coordinates') {
    forecastData = await weatherService.getForecast(
      locationData.lat,
      locationData.lon,
      days,
      units
    );
  } else if (locationData.type === 'zipcode') {
    forecastData = await weatherService.getForecastByZipcode(
      locationData.value,
      country,
      days,
      units
    );
  } else {
    forecastData = await weatherService.getForecastByCity(
      locationData.value,
      country,
      days,
      units
    );
  }

  console.log(JSON.stringify(forecastData, null, 2));
}

async function handleHealth() {
  const healthData = await weatherService.getHealth();
  console.log(JSON.stringify(healthData, null, 2));
}

function parseLocation(location) {
  // Check if it's coordinates (lat,lon format)
  const coordMatch = location.match(/^(-?\d+\.?\d*),(-?\d+\.?\d*)$/);
  if (coordMatch) {
    return {
      type: 'coordinates',
      lat: parseFloat(coordMatch[1]),
      lon: parseFloat(coordMatch[2]),
    };
  }

  // Check if it's a zipcode (numeric)
  if (/^\d+$/.test(location)) {
    return {
      type: 'zipcode',
      value: location,
    };
  }

  // Otherwise treat as city name
  return {
    type: 'city',
    value: location,
  };
}

function showHelp() {
  console.log(`
Weather MCP CLI Tool

Usage:
  npm run cli current <location> [country] [units]
  npm run cli forecast <location> [days] [country] [units]
  npm run cli health

Examples:
  npm run cli current "New York"
  npm run cli current "10001" "US" "imperial"
  npm run cli current "40.7128,-74.0060"
  npm run cli forecast "London" 7
  npm run cli forecast "Tokyo" 3 "JP" "metric"
  npm run cli health

Location formats:
  - City name: "New York", "London"
  - Zipcode: "10001", "75001"
  - Coordinates: "40.7128,-74.0060"

Units: metric (default), imperial, kelvin
  `);
}

main();
