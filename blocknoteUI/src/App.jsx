import React, { useState } from 'react'
import { BlockNoteView } from '@blocknote/react'
import { BlockNote } from '@blocknote/core'
import { WeatherRequestForm } from './components/WeatherRequestForm'
import { WeatherResponse } from './components/WeatherResponse'
import { WeatherService } from './services/WeatherService'
import { Cloud, Sun, Zap } from 'lucide-react'

function App() {
  const [weatherData, setWeatherData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [editor, setEditor] = useState(null)

  // Initialize BlockNote editor
  const blockNote = new BlockNote({
    initialContent: [
      {
        type: 'paragraph',
        content: 'Welcome to Weather Forecast UI! 🌤️\n\nUse the form below to request weather information, and I\'ll format the response beautifully for you.'
      }
    ]
  })

  const handleWeatherRequest = async (requestData) => {
    setIsLoading(true)
    setError(null)
    setWeatherData(null)

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
      
      // Update the editor with formatted weather response
      if (editor) {
        const formattedContent = formatWeatherForEditor(data, requestData)
        editor.replaceBlocks(editor.document, formattedContent)
      }
    } catch (err) {
      setError(err.message)
      console.error('Weather request error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatWeatherForEditor = (data, requestData) => {
    const blocks = []
    
    // Add header
    blocks.push({
      type: 'heading',
      props: { level: 1 },
      content: `🌤️ Weather Report for ${requestData.location}`
    })

    if (data.success && data.data) {
      if (requestData.type === 'current') {
        // Current weather formatting
        const current = data.data.current
        const location = data.data.location

        blocks.push({
          type: 'paragraph',
          content: `📍 Location: ${location.name}, ${location.country}`
        })

        blocks.push({
          type: 'paragraph',
          content: `🌡️ Temperature: ${current.temperature}°${getUnitSymbol(requestData.units)}`
        })

        blocks.push({
          type: 'paragraph',
          content: `🌤️ Condition: ${current.weather.description}`
        })

        blocks.push({
          type: 'paragraph',
          content: `💨 Wind: ${current.wind.speed} km/h from ${current.wind.direction}°`
        })

        blocks.push({
          type: 'paragraph',
          content: `💧 Humidity: ${current.humidity}%`
        })

        blocks.push({
          type: 'paragraph',
          content: `📊 Pressure: ${current.pressure} hPa`
        })

      } else {
        // Forecast formatting
        const daily = data.data.daily
        const location = data.data.location

        blocks.push({
          type: 'paragraph',
          content: `📍 Location: ${location.name}, ${location.country}`
        })

        blocks.push({
          type: 'paragraph',
          content: `📅 ${requestData.days}-Day Forecast`
        })

        daily.slice(0, requestData.days).forEach((day, index) => {
          blocks.push({
            type: 'heading',
            props: { level: 3 },
            content: `Day ${index + 1}: ${new Date(day.date).toLocaleDateString()}`
          })

          blocks.push({
            type: 'paragraph',
            content: `🌡️ High: ${day.temperature.max}°${getUnitSymbol(requestData.units)} | Low: ${day.temperature.min}°${getUnitSymbol(requestData.units)}`
          })

          blocks.push({
            type: 'paragraph',
            content: `🌤️ ${day.weather.description}`
          })

          if (day.precipitation.probability > 0) {
            blocks.push({
              type: 'paragraph',
              content: `🌧️ Precipitation: ${day.precipitation.probability}% chance`
            })
          }
        })
      }
    }

    return blocks
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

          {/* Right Column - BlockNote Editor */}
          <div className="space-y-6">
            <div className="weather-card p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <Cloud className="h-6 w-6 text-weather-blue mr-2" />
                Weather Report
              </h2>
              <div className="min-h-[500px]">
                <BlockNoteView
                  editor={blockNote}
                  onChange={() => {}}
                  onEditorReady={(editor) => setEditor(editor)}
                />
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

export default App
