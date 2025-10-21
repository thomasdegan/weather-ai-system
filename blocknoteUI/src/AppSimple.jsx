import React, { useState } from 'react'
import { WeatherRequestForm } from './components/WeatherRequestForm'
import { WeatherResponse } from './components/WeatherResponse'
import { WeatherService } from './services/WeatherService'
import { Cloud, Sun, Zap, FileText } from 'lucide-react'

function AppSimple() {
  const [weatherData, setWeatherData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formattedReport, setFormattedReport] = useState('')

  const handleWeatherRequest = async (requestData) => {
    setIsLoading(true)
    setError(null)
    setWeatherData(null)
    setFormattedReport('')

    try {
      const weatherService = new WeatherService()
      let data

      if (requestData.type === 'current') {
        data = await weatherService.getCurrentWeather(
          requestData.location,
          requestData.country,
          requestData.units
        )
      } else {
        data = await weatherService.getForecast(
          requestData.location,
          requestData.country,
          requestData.days,
          requestData.units,
          requestData.startDate,
          requestData.endDate
        )
      }

      setWeatherData(data)
      
      // Create formatted report
      const report = formatWeatherReport(data, requestData)
      setFormattedReport(report)
    } catch (err) {
      setError(err.message)
      console.error('Weather request error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatWeatherReport = (data, requestData) => {
    if (!data.success || !data.data) {
      return 'Error: Unable to fetch weather data'
    }

    const { location, current, daily, hourly } = data.data
    let report = `# 🌤️ Weather Report for ${location.name}, ${location.country}\n\n`

    if (current) {
      report += `## Current Weather\n\n`
      report += `🌡️ **Temperature**: ${current.temperature}°${getUnitSymbol(requestData.units)}\n`
      report += `🌤️ **Condition**: ${current.weather.description}\n`
      report += `💨 **Wind**: ${current.wind.speed} km/h from ${current.wind.direction}°\n`
      report += `💧 **Humidity**: ${current.humidity}%\n`
      report += `📊 **Pressure**: ${current.pressure} hPa\n\n`
    }

    if (daily && daily.length > 0) {
      report += `## ${requestData.days}-Day Forecast\n\n`
      daily.slice(0, requestData.days).forEach((day, index) => {
        report += `### Day ${index + 1}: ${new Date(day.date).toLocaleDateString()}\n`
        report += `🌡️ **High**: ${day.temperature.max}°${getUnitSymbol(requestData.units)} | **Low**: ${day.temperature.min}°${getUnitSymbol(requestData.units)}\n`
        report += `🌤️ **Condition**: ${day.weather.description}\n`
        if (day.precipitation.probability > 0) {
          report += `🌧️ **Precipitation**: ${day.precipitation.probability}% chance\n`
        }
        report += `\n`
      })
    }

    return report
  }

  const getUnitSymbol = (units) => {
    switch (units) {
      case 'imperial': return 'F'
      case 'kelvin': return 'K'
      default: return 'C'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-weather-blue via-weather-sky to-weather-ocean">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Cloud className="h-8 w-8 text-white" />
              <Sun className="h-6 w-6 text-yellow-300" />
              <Zap className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Weather Forecast UI</h1>
              <p className="text-white/80">Request weather data and get beautifully formatted responses</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Request Form */}
          <div className="space-y-6">
            <div className="weather-form">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <Sun className="h-6 w-6 text-weather-blue mr-2" />
                Weather Request
              </h2>
              <WeatherRequestForm 
                onSubmit={handleWeatherRequest}
                isLoading={isLoading}
              />
            </div>

            {/* Weather Response Display */}
            {weatherData && (
              <div className="weather-card p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Weather Data</h3>
                <WeatherResponse data={weatherData} />
              </div>
            )}

            {error && (
              <div className="weather-card p-6 bg-red-50 border-red-200">
                <h3 className="text-xl font-semibold text-red-800 mb-2">Error</h3>
                <p className="text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* Right Column - Formatted Report */}
          <div className="space-y-6">
            <div className="weather-card p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <FileText className="h-6 w-6 text-weather-blue mr-2" />
                Weather Report
              </h2>
              <div className="min-h-[500px] max-h-[600px] overflow-y-auto">
                {formattedReport ? (
                  <pre className="whitespace-pre-wrap text-sm font-mono bg-gray-50 p-4 rounded-lg border">
                    {formattedReport}
                  </pre>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Submit a weather request to see the formatted report here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="weather-card p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-weather-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Fetching weather data...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AppSimple
