import Anthropic from '@anthropic-ai/sdk'

export class ClaudeService {
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    })
    this.weatherApiUrl = import.meta.env.VITE_WEATHER_API_URL || 'http://localhost:3001'
  }

  async processWeatherRequest(userMessage) {
    try {
      const systemPrompt = `You are a weather assistant with access to weather data through an API. 

You have access to these weather tools:
1. Current weather: GET ${this.weatherApiUrl}/api/current?location={location}&country={country}&units={units}
2. Weather forecast: GET ${this.weatherApiUrl}/api/forecast?location={location}&country={country}&days={days}&units={units}

When a user asks about weather:
1. Parse their request to extract location, type (current/forecast), units, and other parameters
2. Make the appropriate API call to get weather data
3. Format the response in a helpful, conversational way

Location formats supported:
- City names: "New York", "London"
- Zipcodes: "10001", "75001" 
- Coordinates: "40.7128,-74.0060"

Units: metric (Celsius), imperial (Fahrenheit), kelvin

Always provide helpful, formatted weather information with emojis and clear structure.`

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userMessage
          }
        ],
        tools: [
          {
            name: 'get_current_weather',
            description: 'Get current weather data for a location',
            input_schema: {
              type: 'object',
              properties: {
                location: {
                  type: 'string',
                  description: 'Location to get weather for (city, zipcode, or coordinates)'
                },
                country: {
                  type: 'string',
                  description: 'Country code (optional)'
                },
                units: {
                  type: 'string',
                  enum: ['metric', 'imperial', 'kelvin'],
                  description: 'Temperature units (default: metric)'
                }
              },
              required: ['location']
            }
          },
          {
            name: 'get_weather_forecast',
            description: 'Get weather forecast for a location',
            input_schema: {
              type: 'object',
              properties: {
                location: {
                  type: 'string',
                  description: 'Location to get forecast for'
                },
                country: {
                  type: 'string',
                  description: 'Country code (optional)'
                },
                days: {
                  type: 'number',
                  description: 'Number of days for forecast (1-16, default: 5)'
                },
                units: {
                  type: 'string',
                  enum: ['metric', 'imperial', 'kelvin'],
                  description: 'Temperature units (default: metric)'
                }
              },
              required: ['location']
            }
          }
        ]
      })

      // Handle tool calls
      if (response.content && response.content.length > 0) {
        const content = response.content[0]
        
        if (content.type === 'text') {
          return content.text
        } else if (content.type === 'tool_use') {
          // Execute the tool call
          const toolResult = await this.executeToolCall(content)
          
          // Get Claude's response to the tool result
          const followUpResponse = await this.anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2000,
            system: systemPrompt,
            messages: [
              {
                role: 'user',
                content: userMessage
              },
              {
                role: 'assistant',
                content: [content]
              },
              {
                role: 'user',
                content: [
                  {
                    type: 'tool_result',
                    tool_use_id: content.id,
                    content: JSON.stringify(toolResult)
                  }
                ]
              }
            ]
          })

          return followUpResponse.content[0].text
        }
      }

      return "I'm sorry, I couldn't process your weather request. Please try again."
    } catch (error) {
      console.error('Claude API error:', error)
      throw new Error(`Claude AI error: ${error.message}`)
    }
  }

  async executeToolCall(toolCall) {
    try {
      const { name, input } = toolCall

      if (name === 'get_current_weather') {
        const { location, country, units = 'metric' } = input
        const params = new URLSearchParams({ location, units })
        if (country) params.append('country', country)

        const response = await fetch(`${this.weatherApiUrl}/api/current?${params}`)
        return await response.json()
      } else if (name === 'get_weather_forecast') {
        const { location, country, days = 5, units = 'metric' } = input
        const params = new URLSearchParams({ location, days, units })
        if (country) params.append('country', country)

        const response = await fetch(`${this.weatherApiUrl}/api/forecast?${params}`)
        return await response.json()
      }

      throw new Error(`Unknown tool: ${name}`)
    } catch (error) {
      console.error('Tool execution error:', error)
      return { error: error.message }
    }
  }
}
