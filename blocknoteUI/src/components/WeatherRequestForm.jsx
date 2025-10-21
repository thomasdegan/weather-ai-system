import React, { useState } from 'react'
import { MapPin, Calendar, Settings, Cloud } from 'lucide-react'

export function WeatherRequestForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    type: 'current',
    location: '',
    country: '',
    units: 'metric',
    days: 5,
    startDate: '',
    endDate: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.location.trim()) {
      alert('Please enter a location')
      return
    }
    onSubmit(formData)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Request Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Request Type
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="type"
              value="current"
              checked={formData.type === 'current'}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="mr-2 text-weather-blue"
            />
            Current Weather
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="type"
              value="forecast"
              checked={formData.type === 'forecast'}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="mr-2 text-weather-blue"
            />
            Forecast
          </label>
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          <MapPin className="h-4 w-4 mr-1" />
          Location *
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => handleInputChange('location', e.target.value)}
          placeholder="New York, 10001, or 40.7128,-74.0060"
          className="weather-input"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          City name, zipcode, or coordinates (lat,lon)
        </p>
      </div>

      {/* Country (optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Country (optional)
        </label>
        <input
          type="text"
          value={formData.country}
          onChange={(e) => handleInputChange('country', e.target.value)}
          placeholder="US, GB, etc."
          className="weather-input"
        />
      </div>

      {/* Units */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          <Settings className="h-4 w-4 mr-1" />
          Temperature Units
        </label>
        <select
          value={formData.units}
          onChange={(e) => handleInputChange('units', e.target.value)}
          className="weather-input"
        >
          <option value="metric">Celsius (Metric)</option>
          <option value="imperial">Fahrenheit (Imperial)</option>
          <option value="kelvin">Kelvin</option>
        </select>
      </div>

      {/* Forecast-specific fields */}
      {formData.type === 'forecast' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Number of Days (1-16)
            </label>
            <input
              type="number"
              min="1"
              max="16"
              value={formData.days}
              onChange={(e) => handleInputChange('days', parseInt(e.target.value))}
              className="weather-input"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date (optional)
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="weather-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date (optional)
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className="weather-input"
              />
            </div>
          </div>
        </>
      )}

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading || !formData.location.trim()}
          className="weather-button w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Loading...</span>
            </>
          ) : (
            <>
              <Cloud className="h-4 w-4" />
              <span>Get Weather Data</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
