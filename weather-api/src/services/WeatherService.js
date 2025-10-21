import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Weather Service class that interfaces with Open-Meteo API
 * Open-Meteo is completely free and doesn't require an API key
 */
export class WeatherService {
  constructor() {
    this.baseUrl = process.env.WEATHER_BASE_URL || 'https://api.open-meteo.com/v1';
    // Open-Meteo doesn't require an API key
  }

  /**
   * Get current weather for a specific location
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {string} units - Temperature units (metric, imperial, kelvin)
   * @returns {Promise<Object>} Current weather data
   */
  async getCurrentWeather(lat, lon, units = 'metric') {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          latitude: lat,
          longitude: lon,
          current: [
            'temperature_2m',
            'relative_humidity_2m',
            'apparent_temperature',
            'precipitation',
            'rain',
            'showers',
            'snowfall',
            'weather_code',
            'cloud_cover',
            'pressure_msl',
            'surface_pressure',
            'wind_speed_10m',
            'wind_direction_10m',
            'wind_gusts_10m'
          ],
          temperature_unit: units === 'imperial' ? 'fahrenheit' : 'celsius',
          wind_speed_unit: units === 'imperial' ? 'mph' : 'kmh',
          precipitation_unit: units === 'imperial' ? 'inch' : 'mm'
        }
      });

      return this.formatCurrentWeather(response.data, lat, lon);
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Get current weather by city name
   * @param {string} city - City name
   * @param {string} countryCode - Country code (optional)
   * @param {string} units - Temperature units (metric, imperial, kelvin)
   * @returns {Promise<Object>} Current weather data
   */
  async getCurrentWeatherByCity(city, countryCode = null, units = 'metric') {
    try {
      // First, get coordinates from city name using Nominatim (OpenStreetMap) geocoding
      const geocodingResponse = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: countryCode ? `${city}, ${countryCode}` : city,
          format: 'json',
          limit: 1,
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'WeatherAPI/1.0'
        }
      });

      if (!geocodingResponse.data || geocodingResponse.data.length === 0) {
        throw new Error('Location not found. Please check the city name.');
      }

      const location = geocodingResponse.data[0];
      const lat = parseFloat(location.lat);
      const lon = parseFloat(location.lon);

      // Get weather data using coordinates
      return await this.getCurrentWeather(lat, lon, units);
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Get current weather by zipcode/postal code
   * @param {string} zipcode - Zipcode/postal code
   * @param {string} countryCode - Country code (optional)
   * @param {string} units - Temperature units (metric, imperial, kelvin)
   * @returns {Promise<Object>} Current weather data
   */
  async getCurrentWeatherByZipcode(zipcode, countryCode = null, units = 'metric') {
    try {
      // Use Open-Meteo's geocoding API for zipcode lookup
      const geocodingResponse = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
        params: {
          name: zipcode,
          count: 1,
          language: 'en',
          ...(countryCode && { country: countryCode })
        }
      });

      if (!geocodingResponse.data.results || geocodingResponse.data.results.length === 0) {
        throw new Error('Location not found. Please check the zipcode.');
      }

      const location = geocodingResponse.data.results[0];
      const lat = parseFloat(location.latitude);
      const lon = parseFloat(location.longitude);

      // Get weather data using coordinates
      return await this.getCurrentWeather(lat, lon, units);
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Get weather forecast for a specific location and time span
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {number} days - Number of days for forecast (1-16)
   * @param {string} units - Temperature units (metric, imperial, kelvin)
   * @param {string} startDate - Start date in YYYY-MM-DD format (optional)
   * @param {string} endDate - End date in YYYY-MM-DD format (optional)
   * @returns {Promise<Object>} Forecast data
   */
  async getForecast(lat, lon, days = 5, units = 'metric', startDate = null, endDate = null) {
    try {
      if (days < 1 || days > 16) {
        throw new Error('Forecast days must be between 1 and 16');
      }

      // Validate date format if provided
      if (startDate && !this.isValidDate(startDate)) {
        throw new Error('Start date must be in YYYY-MM-DD format');
      }
      if (endDate && !this.isValidDate(endDate)) {
        throw new Error('End date must be in YYYY-MM-DD format');
      }

      const params = {
        latitude: lat,
        longitude: lon,
        daily: [
          'weather_code',
          'temperature_2m_max',
          'temperature_2m_min',
          'apparent_temperature_max',
          'apparent_temperature_min',
          'precipitation_sum',
          'rain_sum',
          'showers_sum',
          'snowfall_sum',
          'precipitation_hours',
          'precipitation_probability_max',
          'wind_speed_10m_max',
          'wind_gusts_10m_max',
          'wind_direction_10m_dominant'
        ],
        hourly: [
          'temperature_2m',
          'relative_humidity_2m',
          'apparent_temperature',
          'precipitation',
          'rain',
          'showers',
          'snowfall',
          'weather_code',
          'cloud_cover',
          'pressure_msl',
          'wind_speed_10m',
          'wind_direction_10m',
          'wind_gusts_10m'
        ],
        temperature_unit: units === 'imperial' ? 'fahrenheit' : 'celsius',
        wind_speed_unit: units === 'imperial' ? 'mph' : 'kmh',
        precipitation_unit: units === 'imperial' ? 'inch' : 'mm',
        timezone: 'auto'
      };

      // Add date range if provided
      if (startDate) {
        params.start_date = startDate;
      }
      if (endDate) {
        params.end_date = endDate;
      }

      const response = await axios.get(`${this.baseUrl}/forecast`, { params });

      return this.formatForecast(response.data, days, lat, lon);
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Get weather forecast by city name
   * @param {string} city - City name
   * @param {string} countryCode - Country code (optional)
   * @param {number} days - Number of days for forecast (1-16)
   * @param {string} units - Temperature units (metric, imperial, kelvin)
   * @param {string} startDate - Start date in YYYY-MM-DD format (optional)
   * @param {string} endDate - End date in YYYY-MM-DD format (optional)
   * @returns {Promise<Object>} Forecast data
   */
  async getForecastByCity(city, countryCode = null, days = 5, units = 'metric', startDate = null, endDate = null) {
    try {
      if (days < 1 || days > 16) {
        throw new Error('Forecast days must be between 1 and 16');
      }

      // First, get coordinates from city name using Nominatim (OpenStreetMap) geocoding
      const geocodingResponse = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: countryCode ? `${city}, ${countryCode}` : city,
          format: 'json',
          limit: 1,
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'WeatherAPI/1.0'
        }
      });

      if (!geocodingResponse.data || geocodingResponse.data.length === 0) {
        throw new Error('Location not found. Please check the city name.');
      }

      const location = geocodingResponse.data[0];
      const lat = parseFloat(location.lat);
      const lon = parseFloat(location.lon);

      // Get forecast data using coordinates
      return await this.getForecast(lat, lon, days, units, startDate, endDate);
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Get weather forecast by zipcode/postal code
   * @param {string} zipcode - Zipcode/postal code
   * @param {string} countryCode - Country code (optional)
   * @param {number} days - Number of days for forecast (1-16)
   * @param {string} units - Temperature units (metric, imperial, kelvin)
   * @param {string} startDate - Start date in YYYY-MM-DD format (optional)
   * @param {string} endDate - End date in YYYY-MM-DD format (optional)
   * @returns {Promise<Object>} Forecast data
   */
  async getForecastByZipcode(zipcode, countryCode = null, days = 5, units = 'metric', startDate = null, endDate = null) {
    try {
      if (days < 1 || days > 16) {
        throw new Error('Forecast days must be between 1 and 16');
      }

      // Use Open-Meteo's geocoding API for zipcode lookup
      const geocodingResponse = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
        params: {
          name: zipcode,
          count: 1,
          language: 'en',
          ...(countryCode && { country: countryCode })
        }
      });

      if (!geocodingResponse.data.results || geocodingResponse.data.results.length === 0) {
        throw new Error('Location not found. Please check the zipcode.');
      }

      const location = geocodingResponse.data.results[0];
      const lat = parseFloat(location.latitude);
      const lon = parseFloat(location.longitude);

      // Get forecast data using coordinates
      return await this.getForecast(lat, lon, days, units, startDate, endDate);
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Get weather alerts for a specific location
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise<Object>} Weather alerts data
   */
  async getWeatherAlerts(lat, lon) {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          latitude: lat,
          longitude: lon,
          alerts: 'temperature', // Get temperature alerts
          timezone: 'auto'
        }
      });

      return this.formatWeatherAlerts(response.data, lat, lon);
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Get weather alerts by city name
   * @param {string} city - City name
   * @param {string} countryCode - Country code (optional)
   * @returns {Promise<Object>} Weather alerts data
   */
  async getWeatherAlertsByCity(city, countryCode = null) {
    try {
      // First, get coordinates from city name using Nominatim (OpenStreetMap) geocoding
      const geocodingResponse = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: countryCode ? `${city}, ${countryCode}` : city,
          format: 'json',
          limit: 1,
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'WeatherAPI/1.0'
        }
      });

      if (!geocodingResponse.data || geocodingResponse.data.length === 0) {
        throw new Error('Location not found. Please check the city name.');
      }

      const location = geocodingResponse.data[0];
      const lat = parseFloat(location.lat);
      const lon = parseFloat(location.lon);

      // Get weather alerts using coordinates
      return await this.getWeatherAlerts(lat, lon);
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Get weather alerts by zipcode/postal code
   * @param {string} zipcode - Zipcode/postal code
   * @param {string} countryCode - Country code (optional)
   * @returns {Promise<Object>} Weather alerts data
   */
  async getWeatherAlertsByZipcode(zipcode, countryCode = null) {
    try {
      // Use Open-Meteo's geocoding API for zipcode lookup
      const geocodingResponse = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
        params: {
          name: zipcode,
          count: 1,
          language: 'en',
          ...(countryCode && { country: countryCode })
        }
      });

      if (!geocodingResponse.data.results || geocodingResponse.data.results.length === 0) {
        throw new Error('Location not found. Please check the zipcode.');
      }

      const location = geocodingResponse.data.results[0];
      const lat = parseFloat(location.latitude);
      const lon = parseFloat(location.longitude);

      // Get weather alerts using coordinates
      return await this.getWeatherAlerts(lat, lon);
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Format current weather data into a consistent structure
   * @param {Object} data - Raw API response
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Object} Formatted current weather data
   */
  formatCurrentWeather(data, lat, lon) {
    const current = data.current;
    const weatherCode = current.weather_code;
    
    return {
      location: {
        name: data.location?.name || 'Unknown Location',
        country: data.location?.country || 'Unknown',
        coordinates: {
          lat: lat,
          lon: lon
        }
      },
      current: {
        temperature: current.temperature_2m,
        feelsLike: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        pressure: current.pressure_msl,
        visibility: null, // Not available in Open-Meteo current data
        uvIndex: null, // Not available in basic forecast
        weather: {
          main: this.getWeatherMain(weatherCode),
          description: this.getWeatherDescription(weatherCode),
          icon: this.getWeatherIcon(weatherCode)
        },
        wind: {
          speed: current.wind_speed_10m,
          direction: current.wind_direction_10m,
          gust: current.wind_gusts_10m || null
        },
        clouds: current.cloud_cover,
        precipitation: {
          rain: current.rain || 0,
          showers: current.showers || 0,
          snowfall: current.snowfall || 0
        },
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Format weather alerts data into a consistent structure
   * @param {Object} data - Raw API response
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Object} Formatted weather alerts data
   */
  formatWeatherAlerts(data, lat, lon) {
    const alerts = data.alerts || [];
    
    return {
      location: {
        name: data.location?.name || 'Unknown Location',
        country: data.location?.country || 'Unknown',
        coordinates: {
          lat: lat,
          lon: lon
        }
      },
      alerts: alerts.map(alert => ({
        event: alert.event || 'Weather Alert',
        description: alert.description || 'No description available',
        onset: alert.onset || null,
        expires: alert.expires || null,
        severity: alert.severity || 'Unknown',
        certainty: alert.certainty || 'Unknown',
        urgency: alert.urgency || 'Unknown',
        areas: alert.areas || [],
        tags: alert.tags || []
      })),
      alertCount: alerts.length,
      hasAlerts: alerts.length > 0,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Format forecast data into a consistent structure
   * @param {Object} data - Raw API response
   * @param {number} days - Number of days to include
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Object} Formatted forecast data
   */
  formatForecast(data, days, lat, lon) {
    const daily = data.daily;
    const hourly = data.hourly;
    const timezone = data.timezone;
    
    // Create daily forecasts
    const dailyForecasts = [];
    for (let i = 0; i < Math.min(days, daily.time.length); i++) {
      const weatherCode = daily.weather_code[i];
      dailyForecasts.push({
        date: daily.time[i],
        temperature: {
          max: daily.temperature_2m_max[i],
          min: daily.temperature_2m_min[i],
          feelsLikeMax: daily.apparent_temperature_max[i],
          feelsLikeMin: daily.apparent_temperature_min[i]
        },
        weather: {
          main: this.getWeatherMain(weatherCode),
          description: this.getWeatherDescription(weatherCode),
          icon: this.getWeatherIcon(weatherCode)
        },
        precipitation: {
          sum: daily.precipitation_sum[i],
          rain: daily.rain_sum[i],
          showers: daily.showers_sum[i],
          snowfall: daily.snowfall_sum[i],
          hours: daily.precipitation_hours[i],
          probability: daily.precipitation_probability_max[i]
        },
        wind: {
          maxSpeed: daily.wind_speed_10m_max[i],
          maxGust: daily.wind_gusts_10m_max[i],
          direction: daily.wind_direction_10m_dominant[i]
        }
      });
    }

    // Create hourly forecasts for the first day (24 hours)
    const hourlyForecasts = [];
    const hoursToShow = Math.min(24, hourly.time.length);
    for (let i = 0; i < hoursToShow; i++) {
      const weatherCode = hourly.weather_code[i];
      hourlyForecasts.push({
        timestamp: hourly.time[i],
        temperature: {
          current: hourly.temperature_2m[i],
          feelsLike: hourly.apparent_temperature[i]
        },
        humidity: hourly.relative_humidity_2m[i],
        pressure: hourly.pressure_msl[i],
        weather: {
          main: this.getWeatherMain(weatherCode),
          description: this.getWeatherDescription(weatherCode),
          icon: this.getWeatherIcon(weatherCode)
        },
        wind: {
          speed: hourly.wind_speed_10m[i],
          direction: hourly.wind_direction_10m[i],
          gust: hourly.wind_gusts_10m[i] || null
        },
        clouds: hourly.cloud_cover[i],
        precipitation: {
          rain: hourly.rain[i] || 0,
          showers: hourly.showers[i] || 0,
          snowfall: hourly.snowfall[i] || 0
        }
      });
    }
    
    return {
      location: {
        name: data.location?.name || 'Unknown Location',
        country: data.location?.country || 'Unknown',
        coordinates: {
          lat: lat,
          lon: lon
        }
      },
      timezone: timezone,
      daily: dailyForecasts,
      hourly: hourlyForecasts
    };
  }

  /**
   * Validate date format (YYYY-MM-DD)
   * @param {string} dateString - Date string to validate
   * @returns {boolean} True if valid date format
   */
  isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) {
      return false;
    }
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date) && dateString === date.toISOString().split('T')[0];
  }

  /**
   * Get weather main condition from weather code
   * @param {number} code - Weather code
   * @returns {string} Weather main condition
   */
  getWeatherMain(code) {
    const weatherMap = {
      0: 'Clear',
      1: 'Clear', 2: 'Clear', 3: 'Clear',
      45: 'Fog', 48: 'Fog',
      51: 'Drizzle', 53: 'Drizzle', 55: 'Drizzle',
      56: 'Drizzle', 57: 'Drizzle',
      61: 'Rain', 63: 'Rain', 65: 'Rain',
      66: 'Rain', 67: 'Rain',
      71: 'Snow', 73: 'Snow', 75: 'Snow',
      77: 'Snow',
      80: 'Rain', 81: 'Rain', 82: 'Rain',
      85: 'Snow', 86: 'Snow',
      95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm'
    };
    return weatherMap[code] || 'Unknown';
  }

  /**
   * Get weather description from weather code
   * @param {number} code - Weather code
   * @returns {string} Weather description
   */
  getWeatherDescription(code) {
    const descriptionMap = {
      0: 'Clear sky',
      1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
      45: 'Fog', 48: 'Depositing rime fog',
      51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
      56: 'Light freezing drizzle', 57: 'Dense freezing drizzle',
      61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
      66: 'Light freezing rain', 67: 'Heavy freezing rain',
      71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
      77: 'Snow grains',
      80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
      85: 'Slight snow showers', 86: 'Heavy snow showers',
      95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail'
    };
    return descriptionMap[code] || 'Unknown weather';
  }

  /**
   * Get weather icon from weather code
   * @param {number} code - Weather code
   * @returns {string} Weather icon identifier
   */
  getWeatherIcon(code) {
    const iconMap = {
      0: '01d', 1: '02d', 2: '03d', 3: '04d',
      45: '50d', 48: '50d',
      51: '09d', 53: '09d', 55: '09d',
      56: '09d', 57: '09d',
      61: '10d', 63: '10d', 65: '10d',
      66: '10d', 67: '10d',
      71: '13d', 73: '13d', 75: '13d',
      77: '13d',
      80: '09d', 81: '09d', 82: '09d',
      85: '13d', 86: '13d',
      95: '11d', 96: '11d', 99: '11d'
    };
    return iconMap[code] || '01d';
  }

  /**
   * Handle API errors and provide meaningful error messages
   * @param {Error} error - Axios error object
   * @returns {Error} Formatted error
   */
  handleApiError(error) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || 'Weather API error';
      
      switch (status) {
        case 400:
          return new Error('Invalid request parameters. Please check your input.');
        case 404:
          return new Error('Location not found. Please check the coordinates or city name.');
        case 429:
          return new Error('API rate limit exceeded. Please try again later.');
        case 500:
          return new Error('Weather service is temporarily unavailable.');
        default:
          return new Error(`Weather API error: ${message}`);
      }
    } else if (error.request) {
      return new Error('Unable to connect to weather service. Please check your internet connection.');
    } else {
      return new Error(`Weather service error: ${error.message}`);
    }
  }
}
