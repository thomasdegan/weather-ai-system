#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { WeatherService } from './services/WeatherService.js';

// Load environment variables
dotenv.config();

class WeatherMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: process.env.MCP_SERVER_NAME || 'weather-mcp',
        version: process.env.MCP_SERVER_VERSION || '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.weatherService = new WeatherService();
    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_current_weather',
            description: 'Get current weather data for a location',
            inputSchema: {
              type: 'object',
              properties: {
                location: {
                  type: 'string',
                  description: 'Location to get weather for (city name, zipcode, or "lat,lon" coordinates)',
                },
                country: {
                  type: 'string',
                  description: 'Country code (optional, used with city/zipcode)',
                },
                units: {
                  type: 'string',
                  enum: ['metric', 'imperial', 'kelvin'],
                  description: 'Temperature units (default: metric)',
                  default: 'metric',
                },
              },
              required: ['location'],
            },
          },
          {
            name: 'get_weather_forecast',
            description: 'Get weather forecast for a location and time span',
            inputSchema: {
              type: 'object',
              properties: {
                location: {
                  type: 'string',
                  description: 'Location to get forecast for (city name, zipcode, or "lat,lon" coordinates)',
                },
                country: {
                  type: 'string',
                  description: 'Country code (optional, used with city/zipcode)',
                },
                days: {
                  type: 'number',
                  description: 'Number of days for forecast (1-16, default: 5)',
                  minimum: 1,
                  maximum: 16,
                  default: 5,
                },
                start_date: {
                  type: 'string',
                  description: 'Start date in YYYY-MM-DD format (optional)',
                },
                end_date: {
                  type: 'string',
                  description: 'End date in YYYY-MM-DD format (optional)',
                },
                units: {
                  type: 'string',
                  enum: ['metric', 'imperial', 'kelvin'],
                  description: 'Temperature units (default: metric)',
                  default: 'metric',
                },
              },
              required: ['location'],
            },
          },
          {
            name: 'get_weather_health',
            description: 'Check if the weather API is running and healthy',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_current_weather':
            return await this.handleCurrentWeather(args);
          case 'get_weather_forecast':
            return await this.handleWeatherForecast(args);
          case 'get_weather_health':
            return await this.handleWeatherHealth();
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async handleCurrentWeather(args) {
    const { location, country, units = 'metric' } = args;

    if (!location) {
      throw new Error('Location is required');
    }

    // Parse location to determine type
    const locationData = this.parseLocation(location);
    
    // Use country from parsed location or provided country parameter
    const countryToUse = locationData.country || country;
    
    let weatherData;
    if (locationData.type === 'coordinates') {
      weatherData = await this.weatherService.getCurrentWeather(
        locationData.lat,
        locationData.lon,
        units
      );
    } else if (locationData.type === 'zipcode') {
      weatherData = await this.weatherService.getCurrentWeatherByZipcode(
        locationData.value,
        countryToUse,
        units
      );
    } else {
      weatherData = await this.weatherService.getCurrentWeatherByCity(
        locationData.value,
        countryToUse,
        units
      );
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(weatherData, null, 2),
        },
      ],
    };
  }

  async handleWeatherForecast(args) {
    const { 
      location, 
      country, 
      days = 5, 
      start_date, 
      end_date, 
      units = 'metric' 
    } = args;

    if (!location) {
      throw new Error('Location is required');
    }

    // Parse location to determine type
    const locationData = this.parseLocation(location);
    
    // Use country from parsed location or provided country parameter
    const countryToUse = locationData.country || country;
    
    let forecastData;
    if (locationData.type === 'coordinates') {
      forecastData = await this.weatherService.getForecast(
        locationData.lat,
        locationData.lon,
        days,
        units,
        start_date,
        end_date
      );
    } else if (locationData.type === 'zipcode') {
      forecastData = await this.weatherService.getForecastByZipcode(
        locationData.value,
        countryToUse,
        days,
        units,
        start_date,
        end_date
      );
    } else {
      forecastData = await this.weatherService.getForecastByCity(
        locationData.value,
        countryToUse,
        days,
        units,
        start_date,
        end_date
      );
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(forecastData, null, 2),
        },
      ],
    };
  }

  async handleWeatherHealth() {
    const healthData = await this.weatherService.getHealth();
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(healthData, null, 2),
        },
      ],
    };
  }

  parseLocation(location) {
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

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Weather MCP server running on stdio');
  }
}

// Start the server
const server = new WeatherMCPServer();
server.run().catch(console.error);
