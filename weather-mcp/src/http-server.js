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
    const { lat, lon, city, zipcode, country, units = 'metric' } = req.query;

    // Validate required parameters
    if (!city && !zipcode && (!lat || !lon)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Either city, zipcode, or both lat and lon parameters are required'
      });
    }

    // Check for conflicting parameters
    const locationParams = [city, zipcode, (lat && lon ? 'coordinates' : null)].filter(Boolean);
    if (locationParams.length > 1) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Provide only one location parameter: city, zipcode, or lat/lon coordinates'
      });
    }

    // Validate units parameter
    const validUnits = ['metric', 'imperial', 'kelvin'];
    if (!validUnits.includes(units)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Units must be one of: metric, imperial, kelvin'
      });
    }

    let weatherData;
    if (zipcode) {
      weatherData = await weatherService.getCurrentWeatherByZipcode(zipcode, country, units);
    } else if (city) {
      weatherData = await weatherService.getCurrentWeatherByCity(city, country, units);
    } else {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);

      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Latitude and longitude must be valid numbers'
        });
      }

      if (latitude < -90 || latitude > 90) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Latitude must be between -90 and 90'
        });
      }

      if (longitude < -180 || longitude > 180) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Longitude must be between -180 and 180'
        });
      }

      weatherData = await weatherService.getCurrentWeather(latitude, longitude, units);
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
      lat, 
      lon, 
      city, 
      zipcode, 
      country, 
      days = 5, 
      start_date, 
      end_date, 
      units = 'metric' 
    } = req.query;

    // Validate required parameters
    if (!city && !zipcode && (!lat || !lon)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Either city, zipcode, or both lat and lon parameters are required'
      });
    }

    // Check for conflicting parameters
    const locationParams = [city, zipcode, (lat && lon ? 'coordinates' : null)].filter(Boolean);
    if (locationParams.length > 1) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Provide only one location parameter: city, zipcode, or lat/lon coordinates'
      });
    }

    // Validate days parameter
    const daysNum = parseInt(days);
    if (isNaN(daysNum) || daysNum < 1 || daysNum > 16) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Days must be a number between 1 and 16'
      });
    }

    // Validate units parameter
    const validUnits = ['metric', 'imperial', 'kelvin'];
    if (!validUnits.includes(units)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Units must be one of: metric, imperial, kelvin'
      });
    }

    let forecastData;
    if (zipcode) {
      forecastData = await weatherService.getForecastByZipcode(zipcode, country, daysNum, units, start_date, end_date);
    } else if (city) {
      forecastData = await weatherService.getForecastByCity(city, country, daysNum, units, start_date, end_date);
    } else {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);

      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Latitude and longitude must be valid numbers'
        });
      }

      if (latitude < -90 || latitude > 90) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Latitude must be between -90 and 90'
        });
      }

      if (longitude < -180 || longitude > 180) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Longitude must be between -180 and 180'
        });
      }

      forecastData = await weatherService.getForecast(latitude, longitude, daysNum, units, start_date, end_date);
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
