import React from 'react'
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Gauge, 
  Eye, 
  Cloud, 
  Sun,
  Calendar,
  MapPin
} from 'lucide-react'

export function WeatherResponse({ data }) {
  if (!data || !data.success) {
    return (
      <div className="text-red-600">
        <p>Error: {data?.message || 'Failed to fetch weather data'}</p>
      </div>
    )
  }

  const { location, current, daily, hourly } = data.data

  return (
    <div className="space-y-4">
      {/* Location Info */}
      <div className="flex items-center space-x-2 text-gray-600">
        <MapPin className="h-4 w-4" />
        <span>{location.name}, {location.country}</span>
      </div>

      {/* Current Weather */}
      {current && (
        <div className="weather-card p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <Sun className="h-5 w-5 text-yellow-500 mr-2" />
            Current Weather
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Thermometer className="h-4 w-4 text-red-500" />
              <span className="text-sm">
                <span className="font-medium">{current.temperature}°</span>
                <span className="text-gray-500"> (feels like {current.feelsLike}°)</span>
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Cloud className="h-4 w-4 text-blue-500" />
              <span className="text-sm">{current.weather.description}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Droplets className="h-4 w-4 text-blue-400" />
              <span className="text-sm">Humidity: {current.humidity}%</span>
            </div>

            <div className="flex items-center space-x-2">
              <Wind className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{current.wind.speed} km/h</span>
            </div>

            <div className="flex items-center space-x-2">
              <Gauge className="h-4 w-4 text-purple-500" />
              <span className="text-sm">{current.pressure} hPa</span>
            </div>

            {current.visibility && (
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-green-500" />
                <span className="text-sm">{current.visibility} m</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Daily Forecast */}
      {daily && daily.length > 0 && (
        <div className="weather-card p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <Calendar className="h-5 w-5 text-blue-500 mr-2" />
            Daily Forecast
          </h3>
          
          <div className="space-y-3">
            {daily.slice(0, 7).map((day, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-sm font-medium">
                    {new Date(day.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Thermometer className="h-4 w-4 text-red-500" />
                    <span className="text-sm">
                      {day.temperature.max}° / {day.temperature.min}°
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Cloud className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">{day.weather.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hourly Forecast (first 12 hours) */}
      {hourly && hourly.length > 0 && (
        <div className="weather-card p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Next 12 Hours
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {hourly.slice(0, 12).map((hour, index) => (
              <div key={index} className="text-center p-2 bg-gray-50 rounded">
                <div className="text-xs text-gray-500">
                  {new Date(hour.timestamp).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })}
                </div>
                <div className="text-sm font-medium">
                  {hour.temperature.current}°
                </div>
                <div className="text-xs text-gray-600">
                  {hour.weather.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw Data (for debugging) */}
      <details className="weather-card p-4">
        <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
          Raw Data (click to expand)
        </summary>
        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  )
}
