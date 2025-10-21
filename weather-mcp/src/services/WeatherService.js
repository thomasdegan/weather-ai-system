import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Weather Service class that interfaces with the weather API
 */
export class WeatherService {
  constructor() {
    this.baseUrl = process.env.WEATHER_API_URL || 'http://localhost:3000';
    this.timeout = parseInt(process.env.WEATHER_API_TIMEOUT) || 10000;
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
      const response = await axios.get(`${this.baseUrl}/api/weather/current`, {
        params: {
          lat,
          lon,
          units,
        },
        timeout: this.timeout,
      });

      return response.data;
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
      const params = {
        city,
        units,
      };
      
      if (countryCode) {
        params.country = countryCode;
      }

      const response = await axios.get(`${this.baseUrl}/api/weather/current`, {
        params,
        timeout: this.timeout,
      });

      return response.data;
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
      const params = {
        zipcode,
        units,
      };
      
      if (countryCode) {
        params.country = countryCode;
      }

      const response = await axios.get(`${this.baseUrl}/api/weather/current`, {
        params,
        timeout: this.timeout,
      });

      return response.data;
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
      const params = {
        lat,
        lon,
        days,
        units,
      };
      
      if (startDate) {
        params.start_date = startDate;
      }
      if (endDate) {
        params.end_date = endDate;
      }

      const response = await axios.get(`${this.baseUrl}/api/weather/forecast`, {
        params,
        timeout: this.timeout,
      });

      return response.data;
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
      const params = {
        city,
        days,
        units,
      };
      
      if (countryCode) {
        params.country = countryCode;
      }
      if (startDate) {
        params.start_date = startDate;
      }
      if (endDate) {
        params.end_date = endDate;
      }

      const response = await axios.get(`${this.baseUrl}/api/weather/forecast`, {
        params,
        timeout: this.timeout,
      });

      return response.data;
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
      const params = {
        zipcode,
        days,
        units,
      };
      
      if (countryCode) {
        params.country = countryCode;
      }
      if (startDate) {
        params.start_date = startDate;
      }
      if (endDate) {
        params.end_date = endDate;
      }

      const response = await axios.get(`${this.baseUrl}/api/weather/forecast`, {
        params,
        timeout: this.timeout,
      });

      return response.data;
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
      const response = await axios.get(`${this.baseUrl}/api/weather/alerts`, {
        params: {
          lat,
          lon,
        },
        timeout: this.timeout,
      });

      return response.data;
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
      const params = {
        city,
      };
      
      if (countryCode) {
        params.country = countryCode;
      }

      const response = await axios.get(`${this.baseUrl}/api/weather/alerts`, {
        params,
        timeout: this.timeout,
      });

      return response.data;
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
      const params = {
        zipcode,
      };
      
      if (countryCode) {
        params.country = countryCode;
      }

      const response = await axios.get(`${this.baseUrl}/api/weather/alerts`, {
        params,
        timeout: this.timeout,
      });

      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Check if the weather API is healthy
   * @returns {Promise<Object>} Health status
   */
  async getHealth() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/weather/health`, {
        timeout: this.timeout,
      });

      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
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
          return new Error(`Invalid request: ${message}`);
        case 404:
          return new Error(`Location not found: ${message}`);
        case 500:
          return new Error(`Weather API server error: ${message}`);
        default:
          return new Error(`Weather API error (${status}): ${message}`);
      }
    } else if (error.request) {
      return new Error('Unable to connect to weather API. Please ensure the weather API server is running.');
    } else {
      return new Error(`Weather service error: ${error.message}`);
    }
  }
}
