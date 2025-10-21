import React, { useState, useRef } from 'react'
import { WeatherService } from './services/WeatherService'
import { Cloud, Sun, Zap, Send, Bot, User, FileText } from 'lucide-react'

function AppAISimple() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Hello! I\'m your weather assistant. Ask me about current weather or forecasts for any location. For example: "What\'s the weather in New York?" or "Give me a 5-day forecast for London."',
      timestamp: new Date()
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [formattedReport, setFormattedReport] = useState('Welcome to Weather AI Assistant! 🌤️\n\nAsk me about weather in natural language:\n• "What\'s the weather in Paris?"\n• "Give me a 3-day forecast for Tokyo"\n• "How\'s the weather in 10001?"\n• "Current conditions in London, UK"')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Process the natural language request
      const response = await processWeatherRequest(inputValue)
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
      
      // Update the formatted report
      setFormattedReport(response)
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: `Sorry, I encountered an error: ${error.message}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const processWeatherRequest = async (prompt) => {
    const weatherService = new WeatherService()
    
    // Parse the natural language prompt
    const parsed = parseWeatherPrompt(prompt)
    
    if (!parsed.location) {
      return "I need a location to get weather information. Please specify a city, zipcode, or coordinates."
    }

    try {
      let data
      if (parsed.type === 'current') {
        data = await weatherService.getCurrentWeather(parsed.location, parsed.country, parsed.units)
      } else {
        data = await weatherService.getForecast(parsed.location, parsed.country, parsed.days, parsed.units)
      }

      return formatWeatherResponse(data, parsed)
    } catch (error) {
      throw new Error(`Failed to get weather data: ${error.message}`)
    }
  }

  const parseWeatherPrompt = (prompt) => {
    const lowerPrompt = prompt.toLowerCase()
    
    // Determine request type
    const isForecast = lowerPrompt.includes('forecast') || lowerPrompt.includes('days') || lowerPrompt.includes('week')
    const type = isForecast ? 'forecast' : 'current'
    
    // Extract days if forecast
    let days = 5
    const daysMatch = lowerPrompt.match(/(\d+)\s*days?/)
    if (daysMatch) {
      days = parseInt(daysMatch[1])
    }
    
    // Extract units
    let units = 'metric'
    if (lowerPrompt.includes('fahrenheit') || lowerPrompt.includes('imperial')) {
      units = 'imperial'
    } else if (lowerPrompt.includes('kelvin')) {
      units = 'kelvin'
    }
    
    // Extract location with improved parsing
    let location = ''
    let country = ''
    
    // Remove common question words and clean up the prompt
    let cleanPrompt = prompt
      .replace(/^(what's|how's|what is|how is)\s+(the\s+)?(weather|forecast)\s+(in|for|at)\s+/i, '')
      .replace(/^(give me|get me|show me)\s+(a\s+)?(\d+\s*day\s+)?(weather\s+)?(forecast\s+)?(for|in|at)\s+/i, '')
      .replace(/^(current\s+)?(weather|forecast)\s+(in|for|at)\s+/i, '')
      .replace(/\?+$/, '') // Remove trailing question marks
      .trim()
    
    // Extract location and country
    const locationMatch = cleanPrompt.match(/^([^,]+?)(?:\s*,?\s*([a-z]{2}))?$/i)
    if (locationMatch) {
      location = locationMatch[1].trim()
      if (locationMatch[2]) {
        country = locationMatch[2].trim().toUpperCase()
      }
    } else {
      // Fallback: use the cleaned prompt as location
      location = cleanPrompt
    }
    
    // Additional cleanup for common patterns
    location = location
      .replace(/^(in|for|at)\s+/i, '') // Remove leading prepositions
      .replace(/\s+(in|for|at)\s+.*$/i, '') // Remove trailing prepositions and everything after
      .trim()
    
    console.log('Parsed prompt:', { original: prompt, clean: cleanPrompt, location, country, type, days, units })
    
    return { type, location, country, days, units }
  }

  const formatWeatherResponse = (data, parsed) => {
    if (!data.success || !data.data) {
      return "Sorry, I couldn't get weather data for that location. Please try a different location."
    }

    const { location, current, daily } = data.data
    let response = `🌤️ **Weather for ${location.name}, ${location.country}**\n\n`

    if (current) {
      response += `**Current Conditions:**\n`
      response += `🌡️ Temperature: ${current.temperature}°${getUnitSymbol(parsed.units)}\n`
      response += `🌤️ Condition: ${current.weather.description}\n`
      response += `💨 Wind: ${current.wind.speed} km/h\n`
      response += `💧 Humidity: ${current.humidity}%\n`
      response += `📊 Pressure: ${current.pressure} hPa\n\n`
    }

    if (daily && daily.length > 0) {
      response += `**${parsed.days}-Day Forecast:**\n`
      daily.slice(0, parsed.days).forEach((day, index) => {
        response += `\n**Day ${index + 1} (${new Date(day.date).toLocaleDateString()}):**\n`
        response += `🌡️ High: ${day.temperature.max}°${getUnitSymbol(parsed.units)} | Low: ${day.temperature.min}°${getUnitSymbol(parsed.units)}\n`
        response += `🌤️ ${day.weather.description}\n`
        if (day.precipitation.probability > 0) {
          response += `🌧️ Precipitation: ${day.precipitation.probability}% chance\n`
        }
      })
    }

    return response
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
              <h1 className="text-3xl font-bold text-white">Weather AI Assistant</h1>
              <p className="text-white/80">Ask me about weather in natural language</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Chat Interface */}
          <div className="space-y-6">
            <div className="weather-card p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <Bot className="h-6 w-6 text-weather-blue mr-2" />
                Chat with Weather AI
              </h2>
              
              {/* Messages */}
              <div className="h-96 overflow-y-auto space-y-4 mb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-weather-blue text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {message.type === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Bot className="h-4 w-4" />
                        <div className="animate-pulse">Thinking...</div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about weather... (e.g., 'What's the weather in Washington, DC?')"
                  className="flex-1 weather-input"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="weather-button flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Formatted Report */}
          <div className="space-y-6">
            <div className="weather-card p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <FileText className="h-6 w-6 text-weather-blue mr-2" />
                Weather Report
              </h2>
              <div className="min-h-[500px] max-h-[600px] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm font-mono bg-gray-50 p-4 rounded-lg border">
                  {formattedReport}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppAISimple
