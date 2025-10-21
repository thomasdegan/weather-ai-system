#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { WeatherService } from './services/WeatherService.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.HTTP_PORT || 3001;
const weatherService = new WeatherService();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Weather MCP HTTP Server is running',
    timestamp: new Date().toISOString()
  });
});

// Current weather endpoint
app.get('/api/current', async (req, res) => {
  try {
    const { location, country, units = 'metric' } = req.query;

    if (!location) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Location parameter is required'
      });
    }

    // Parse location to determine type
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

    res.json(weatherData);
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Weather forecast endpoint
app.get('/api/forecast', async (req, res) => {
  try {
    const { 
      location, 
      country, 
      days = 5, 
      start_date, 
      end_date, 
      units = 'metric' 
    } = req.query;

    if (!location) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Location parameter is required'
      });
    }

    // Parse location to determine type
    const locationData = parseLocation(location);
    
    let forecastData;
    if (locationData.type === 'coordinates') {
      forecastData = await weatherService.getForecast(
        locationData.lat,
        locationData.lon,
        parseInt(days),
        units,
        start_date,
        end_date
      );
    } else if (locationData.type === 'zipcode') {
      forecastData = await weatherService.getForecastByZipcode(
        locationData.value,
        country,
        parseInt(days),
        units,
        start_date,
        end_date
      );
    } else {
      forecastData = await weatherService.getForecastByCity(
        locationData.value,
        country,
        parseInt(days),
        units,
        start_date,
        end_date
      );
    }

    res.json(forecastData);
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Weather API health check
app.get('/api/weather-health', async (req, res) => {
  try {
    const healthData = await weatherService.getHealth();
    res.json(healthData);
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Helper function to parse location
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

  // Check if it's city, country format (e.g., "Paris, France")
  const cityCountryMatch = location.match(/^(.+),\s*(.+)$/);
  if (cityCountryMatch) {
    return {
      type: 'city',
      value: cityCountryMatch[1].trim(),
      country: cityCountryMatch[2].trim(),
    };
  }

  // Otherwise treat as city name
  return {
    type: 'city',
    value: location,
  };
}

// Start server
app.listen(PORT, () => {
  console.log(`🌤️  Weather MCP HTTP Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🌡️  Current weather: http://localhost:${PORT}/api/current?location=New York`);
  console.log(`📊 Forecast: http://localhost:${PORT}/api/forecast?location=London&days=5`);
});

export default app;
