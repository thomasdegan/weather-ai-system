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
app.use(express.static('public'));

// Serve the web interface
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weather MCP Web Interface</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: white;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        h1 {
            text-align: center;
            margin-bottom: 30px;
            font-size: 2.5em;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
        }
        input, select, button {
            width: 100%;
            padding: 12px;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            box-sizing: border-box;
        }
        input, select {
            background: rgba(255, 255, 255, 0.9);
            color: #333;
        }
        button {
            background: linear-gradient(45deg, #ff6b6b, #ee5a24);
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
        }
        button:hover {
            transform: translateY(-2px);
        }
        .result {
            margin-top: 20px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .loading {
            text-align: center;
            font-style: italic;
        }
        .error {
            color: #ff6b6b;
            background: rgba(255, 107, 107, 0.1);
            border: 1px solid #ff6b6b;
        }
        pre {
            background: rgba(0, 0, 0, 0.3);
            padding: 15px;
            border-radius: 8px;
            overflow-x: auto;
            white-space: pre-wrap;
        }
        .tabs {
            display: flex;
            margin-bottom: 20px;
        }
        .tab {
            flex: 1;
            padding: 10px;
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: white;
            cursor: pointer;
            border-radius: 10px 10px 0 0;
        }
        .tab.active {
            background: rgba(255, 255, 255, 0.2);
        }
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌤️ Weather MCP Interface</h1>
        
        <div class="tabs">
            <button class="tab active" onclick="showTab('current')">Current Weather</button>
            <button class="tab" onclick="showTab('forecast')">Forecast</button>
            <button class="tab" onclick="showTab('health')">Health Check</button>
        </div>

        <div id="current" class="tab-content active">
            <h2>Current Weather</h2>
            <form onsubmit="getCurrentWeather(event)">
                <div class="form-group">
                    <label for="current-location">Location:</label>
                    <input type="text" id="current-location" placeholder="New York, 10001, or 40.7128,-74.0060" required>
                </div>
                <div class="form-group">
                    <label for="current-country">Country (optional):</label>
                    <input type="text" id="current-country" placeholder="US, GB, etc.">
                </div>
                <div class="form-group">
                    <label for="current-units">Units:</label>
                    <select id="current-units">
                        <option value="metric">Celsius (Metric)</option>
                        <option value="imperial">Fahrenheit (Imperial)</option>
                        <option value="kelvin">Kelvin</option>
                    </select>
                </div>
                <button type="submit">Get Current Weather</button>
            </form>
        </div>

        <div id="forecast" class="tab-content">
            <h2>Weather Forecast</h2>
            <form onsubmit="getForecast(event)">
                <div class="form-group">
                    <label for="forecast-location">Location:</label>
                    <input type="text" id="forecast-location" placeholder="New York, 10001, or 40.7128,-74.0060" required>
                </div>
                <div class="form-group">
                    <label for="forecast-days">Days (1-16):</label>
                    <input type="number" id="forecast-days" min="1" max="16" value="5">
                </div>
                <div class="form-group">
                    <label for="forecast-country">Country (optional):</label>
                    <input type="text" id="forecast-country" placeholder="US, GB, etc.">
                </div>
                <div class="form-group">
                    <label for="forecast-units">Units:</label>
                    <select id="forecast-units">
                        <option value="metric">Celsius (Metric)</option>
                        <option value="imperial">Fahrenheit (Imperial)</option>
                        <option value="kelvin">Kelvin</option>
                    </select>
                </div>
                <button type="submit">Get Forecast</button>
            </form>
        </div>

        <div id="health" class="tab-content">
            <h2>Health Check</h2>
            <button onclick="checkHealth()">Check Weather API Health</button>
        </div>

        <div id="result" class="result" style="display: none;">
            <h3>Result:</h3>
            <pre id="result-content"></pre>
        </div>
    </div>

    <script>
        function showTab(tabName) {
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });

            // Show selected tab
            document.getElementById(tabName).classList.add('active');
            event.target.classList.add('active');
        }

        async function getCurrentWeather(event) {
            event.preventDefault();
            const location = document.getElementById('current-location').value;
            const country = document.getElementById('current-country').value;
            const units = document.getElementById('current-units').value;

            showLoading();
            
            try {
                const params = new URLSearchParams({ location, units });
                if (country) params.append('country', country);
                
                const response = await fetch(\`/api/current?\${params}\`);
                const data = await response.json();
                
                if (response.ok) {
                    showResult(JSON.stringify(data, null, 2));
                } else {
                    showError(data.message || 'Error fetching current weather');
                }
            } catch (error) {
                showError('Error: ' + error.message);
            }
        }

        async function getForecast(event) {
            event.preventDefault();
            const location = document.getElementById('forecast-location').value;
            const days = document.getElementById('forecast-days').value;
            const country = document.getElementById('forecast-country').value;
            const units = document.getElementById('forecast-units').value;

            showLoading();
            
            try {
                const params = new URLSearchParams({ location, days, units });
                if (country) params.append('country', country);
                
                const response = await fetch(\`/api/forecast?\${params}\`);
                const data = await response.json();
                
                if (response.ok) {
                    showResult(JSON.stringify(data, null, 2));
                } else {
                    showError(data.message || 'Error fetching forecast');
                }
            } catch (error) {
                showError('Error: ' + error.message);
            }
        }

        async function checkHealth() {
            showLoading();
            
            try {
                const response = await fetch('/api/weather-health');
                const data = await response.json();
                
                if (response.ok) {
                    showResult(JSON.stringify(data, null, 2));
                } else {
                    showError(data.message || 'Error checking health');
                }
            } catch (error) {
                showError('Error: ' + error.message);
            }
        }

        function showLoading() {
            const result = document.getElementById('result');
            const content = document.getElementById('result-content');
            result.style.display = 'block';
            result.className = 'result loading';
            content.textContent = 'Loading...';
        }

        function showResult(data) {
            const result = document.getElementById('result');
            const content = document.getElementById('result-content');
            result.style.display = 'block';
            result.className = 'result';
            content.textContent = data;
        }

        function showError(message) {
            const result = document.getElementById('result');
            const content = document.getElementById('result-content');
            result.style.display = 'block';
            result.className = 'result error';
            content.textContent = message;
        }
    </script>
</body>
</html>
  `);
});

// API endpoints (same as http-server.js)
app.get('/api/current', async (req, res) => {
  try {
    const { lat, lon, city, zipcode, country, units = 'metric' } = req.query;

    // Log the request from AI model
    console.log('🌤️ Weather MCP - Current Weather Request:');
    console.log(`   Lat: ${lat || 'not specified'}`);
    console.log(`   Lon: ${lon || 'not specified'}`);
    console.log(`   City: ${city || 'not specified'}`);
    console.log(`   Zipcode: ${zipcode || 'not specified'}`);
    console.log(`   Country: ${country || 'not specified'}`);
    console.log(`   Units: ${units}`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);
    console.log('---');

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

    // Log successful response
    const locationName = city || zipcode || `${lat},${lon}`;
    console.log(`✅ Weather data retrieved for ${locationName}`);
    console.log('---');

    res.json(weatherData);
  } catch (error) {
    const locationName = city || zipcode || `${lat},${lon}`;
    console.log(`❌ Error getting weather for ${locationName}: ${error.message}`);
    console.log('---');
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

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

    // Log the request from AI model
    console.log('📊 Weather MCP - Forecast Request:');
    console.log(`   Lat: ${lat || 'not specified'}`);
    console.log(`   Lon: ${lon || 'not specified'}`);
    console.log(`   City: ${city || 'not specified'}`);
    console.log(`   Zipcode: ${zipcode || 'not specified'}`);
    console.log(`   Country: ${country || 'not specified'}`);
    console.log(`   Days: ${days}`);
    console.log(`   Units: ${units}`);
    console.log(`   Start Date: ${start_date || 'not specified'}`);
    console.log(`   End Date: ${end_date || 'not specified'}`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);
    console.log('---');

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

    // Log successful response
    const locationName = city || zipcode || `${lat},${lon}`;
    console.log(`✅ Forecast data retrieved for ${locationName} (${days} days)`);
    console.log('---');

    res.json(forecastData);
  } catch (error) {
    const locationName = city || zipcode || `${lat},${lon}`;
    console.log(`❌ Error getting forecast for ${locationName}: ${error.message}`);
    console.log('---');
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

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
  console.log(`🌐 Weather MCP Web Interface running on port ${PORT}`);
  console.log(`🌍 Open your browser: http://localhost:${PORT}`);
});

export default app;
