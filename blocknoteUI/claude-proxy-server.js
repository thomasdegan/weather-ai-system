#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';

// Load environment variables
dotenv.config();

// Debug environment variables
console.log('🔧 Environment check:');
console.log('   ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? 'Set' : 'Missing');
console.log('   WEATHER_API_URL:', process.env.WEATHER_API_URL);
console.log('   CLAUDE_PROXY_PORT:', process.env.CLAUDE_PROXY_PORT);

const app = express();
const PORT = process.env.CLAUDE_PROXY_PORT || 3003;
const weatherApiUrl = process.env.WEATHER_API_URL || 'http://localhost:3001';

// Initialize Claude
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Claude Proxy Server is running',
    timestamp: new Date().toISOString()
  });
});

// Claude weather endpoint
app.post('/api/claude/weather', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Message is required'
      });
    }

    console.log('🤖 Claude Proxy - Weather Request:', message);

    const systemPrompt = `You are a weather assistant with access to weather data through an API. 

You have access to these weather tools:
1. Current weather: GET ${weatherApiUrl}/api/current?location={location}&country={country}&units={units}
2. Weather forecast: GET ${weatherApiUrl}/api/forecast?location={location}&country={country}&days={days}&units={units}
3. Weather comparison: Compare current weather between multiple locations

When a user asks about weather:
1. Parse their request to extract location, type (current/forecast/comparison), units, and other parameters
2. Make the appropriate API call to get weather data
3. Format the response in a helpful, conversational way

For comparison requests (e.g., "Compare weather in Miami vs Seattle"):
- Use the compare_weather tool to get data for both locations
- Present a side-by-side comparison with clear differences
- Highlight key differences in temperature, conditions, etc.

Location formats supported:
- City names: "New York", "London"
- Zipcodes: "10001", "75001" 
- Coordinates: "40.7128,-74.0060"

Units: metric (Celsius), imperial (Fahrenheit), kelvin

Always provide helpful, formatted weather information with emojis and clear structure.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: message
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
        },
        {
          name: 'compare_weather',
          description: 'Compare current weather between two or more locations',
          input_schema: {
            type: 'object',
            properties: {
              locations: {
                type: 'array',
                items: {
                  type: 'string'
                },
                description: 'Array of locations to compare (city names, zipcodes, or coordinates)',
                minItems: 2
              },
              countries: {
                type: 'array',
                items: {
                  type: 'string'
                },
                description: 'Array of country codes (optional, must match locations array length)'
              },
              units: {
                type: 'string',
                enum: ['metric', 'imperial', 'kelvin'],
                description: 'Temperature units (default: metric)'
              }
            },
            required: ['locations']
          }
        }
      ]
    });

    // Handle tool calls
    if (response.content && response.content.length > 0) {
      const content = response.content[0];
      
      if (content.type === 'text') {
        console.log('✅ Claude response (text):', content.text.substring(0, 100) + '...');
        return res.json({ response: content.text });
      } else if (content.type === 'tool_use') {
        console.log('🔧 Claude using tool:', content.name);
        
        // Execute the tool call
        const toolResult = await executeToolCall(content);
        
        // Get Claude's response to the tool result
        const followUpResponse = await anthropic.messages.create({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 2000,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: message
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
        });

        const finalResponse = followUpResponse.content[0].text;
        console.log('✅ Claude final response:', finalResponse.substring(0, 100) + '...');
        return res.json({ response: finalResponse });
      }
    }

    return res.json({ response: "I'm sorry, I couldn't process your weather request. Please try again." });
  } catch (error) {
    console.error('❌ Claude proxy error:', error);
    console.error('Error details:', error.toString());
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      details: error.toString()
    });
  }
});

async function executeToolCall(toolCall) {
  try {
    const { name, input } = toolCall;

    if (name === 'get_current_weather') {
      const { location, country, units = 'metric' } = input;
      const params = new URLSearchParams({ location, units });
      if (country) params.append('country', country);

      console.log(`🌤️ Fetching current weather for ${location}`);
      const response = await axios.get(`${weatherApiUrl}/api/current?${params}`);
      return response.data;
    } else if (name === 'get_weather_forecast') {
      const { location, country, days = 5, units = 'metric' } = input;
      const params = new URLSearchParams({ location, days, units });
      if (country) params.append('country', country);

      console.log(`📊 Fetching ${days}-day forecast for ${location}`);
      const response = await axios.get(`${weatherApiUrl}/api/forecast?${params}`);
      return response.data;
    } else if (name === 'compare_weather') {
      const { locations, countries, units = 'metric' } = input;
      
      console.log(`🔄 Comparing weather for ${locations.join(', ')}`);
      
      // Fetch weather data for all locations
      const weatherPromises = locations.map(async (location, index) => {
        const params = new URLSearchParams({ location, units });
        if (countries && countries[index]) {
          params.append('country', countries[index]);
        }
        
        try {
          const response = await axios.get(`${weatherApiUrl}/api/current?${params}`);
          return {
            location,
            data: response.data,
            success: true
          };
        } catch (error) {
          return {
            location,
            error: error.message,
            success: false
          };
        }
      });
      
      const results = await Promise.all(weatherPromises);
      
      return {
        comparison: results,
        units,
        timestamp: new Date().toISOString()
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    console.error('Tool execution error:', error);
    return { error: error.message };
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`🤖 Claude Proxy Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🌤️ Weather API: ${weatherApiUrl}`);
  console.log(`🔑 Claude API: ${process.env.ANTHROPIC_API_KEY ? 'Configured' : 'Missing API Key'}`);
});

export default app;
