import axios from 'axios'

export class WeatherService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_WEATHER_API_URL || 'http://localhost:3001'
    this.timeout = 10000
  }

  /**
   * Parse location to determine type (coordinates, zipcode, or city)
   */
  parseLocation(location) {
    // Check if it's coordinates (lat,lon format)
    const coordMatch = location.match(/^(-?\d+\.?\d*),(-?\d+\.?\d*)$/)
    if (coordMatch) {
      return {
        type: 'coordinates',
        lat: parseFloat(coordMatch[1]),
        lon: parseFloat(coordMatch[2])
      }
    }

    // Check if it's a zipcode (numeric)
    if (/^\d+$/.test(location)) {
      return {
        type: 'zipcode',
        value: location
      }
    }

    // Otherwise treat as city name
    return {
      type: 'city',
      value: location
    }
  }

  /**
   * Get current weather for a location
   */
  async getCurrentWeather(location, country = null, units = 'metric') {
    try {
      const locationData = this.parseLocation(location)
      const params = { units }
      
      if (country) params.country = country

      // Always use the same endpoint and pass location as a single parameter
      const url = `${this.baseUrl}/api/current`
      params.location = location

      const response = await axios.get(url, {
        params,
        timeout: this.timeout
      })

      return response.data
    } catch (error) {
      throw this.handleApiError(error)
    }
  }

  /**
   * Get weather forecast for a location
   */
  async getForecast(location, country = null, days = 5, units = 'metric', startDate = null, endDate = null) {
    try {
      const params = { 
        location,
        days, 
        units 
      }
      
      if (country) params.country = country
      if (startDate) params.start_date = startDate
      if (endDate) params.end_date = endDate

      const url = `${this.baseUrl}/api/forecast`

      const response = await axios.get(url, {
        params,
        timeout: this.timeout
      })

      return response.data
    } catch (error) {
      throw this.handleApiError(error)
    }
  }

  /**
   * Check weather API health
   */
  async getHealth() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/weather-health`, {
        timeout: this.timeout
      })

      return response.data
    } catch (error) {
      throw this.handleApiError(error)
    }
  }

  /**
   * Handle API errors
   */
  handleApiError(error) {
    if (error.response) {
      const status = error.response.status
      const message = error.response.data?.message || 'Weather API error'
      
      switch (status) {
        case 400:
          return new Error(`Invalid request: ${message}`)
        case 404:
          return new Error(`Location not found: ${message}`)
        case 500:
          return new Error(`Weather API server error: ${message}`)
        default:
          return new Error(`Weather API error (${status}): ${message}`)
      }
    } else if (error.request) {
      return new Error('Unable to connect to weather API. Please ensure the weather API server is running.')
    } else {
      return new Error(`Weather service error: ${error.message}`)
    }
  }
}
