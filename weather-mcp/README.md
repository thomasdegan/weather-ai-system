# Weather MCP Server

A Model Context Protocol (MCP) server that provides weather tools for Claude.ai by connecting to your weather API. Includes multiple interfaces: MCP for Claude Desktop, HTTP API, and CLI.

## 🌟 Features

### **Multiple Interface Options**
- **🔗 HTTP API**: REST endpoints for programmatic access
- **💻 CLI Tool**: Command-line interface for quick weather queries
- **🤖 MCP Server**: Direct integration with Claude.ai via MCP

### **Weather Tools**
- **Current Weather**: Get real-time weather data for any location
- **Weather Forecasts**: Get 1-16 day weather forecasts with detailed data
- **Health Check**: Verify weather API connectivity
- **Flexible Location Support**: Coordinates, city names, or zipcodes
- **Multiple Units**: Celsius, Fahrenheit, or Kelvin

### **MCP Integration**
- **Claude.ai Compatible**: Direct integration with Claude.ai via MCP
- **Tool-based Interface**: Clean tool definitions for weather queries
- **Error Handling**: Comprehensive error messages and validation
- **Type Safety**: Full TypeScript-style parameter validation

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- Your weather API running (see `../weather-api/README.md`)

### 2. Installation

```bash
cd weather-mcp
npm install
```

### 3. Configuration

Copy the example environment file:

```bash
cp env.example .env
```

Edit `.env` to match your setup:

```env
# Weather API Configuration
WEATHER_API_URL=http://localhost:3000
WEATHER_API_TIMEOUT=10000

# MCP Server Configuration
MCP_SERVER_NAME=weather-mcp
MCP_SERVER_VERSION=1.0.0
```

## 🔗 **HTTP API**

**Start the HTTP server:**
```bash
npm run http
```

**Use with curl or any HTTP client:**
```bash
# Current weather
curl "http://localhost:3001/api/current?location=New York&units=metric"

# Forecast
curl "http://localhost:3001/api/forecast?location=London&days=7&units=metric"

# Health check
curl "http://localhost:3001/api/weather-health"
```

## 💻 **Command Line Interface**

**Use the CLI tool:**
```bash
# Current weather
npm run cli current "New York"
npm run cli current "10001" "US" "imperial"
npm run cli current "40.7128,-74.0060"

# Forecast
npm run cli forecast "London" 7
npm run cli forecast "Tokyo" 3 "JP" "metric"

# Health check
npm run cli health
```

## 🤖 **Option 4: MCP Server for Claude Desktop**

**Start the MCP server:**
```bash
npm start
```

**Configure Claude Desktop** (see detailed instructions below)

## 🤖 Claude Desktop Integration

### Adding to Claude Desktop

**Step 1: Find the correct config location**

**Windows**: `%APPDATA%\Roaming\Claude\claude_desktop_config.json`
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Step 2: Create the config file**

```json
{
  "mcpServers": {
    "weather-mcp": {
      "command": "node",
      "args": ["D:\\development\\flipside\\hackathonOct2025\\weather\\weather-mcp\\src\\index.js"],
      "env": {
        "WEATHER_API_URL": "http://localhost:3000"
      }
    }
  }
}
```

**Note**: Update the path to match your actual `weather-mcp` directory.

**Step 3: Restart Claude Desktop**
- Close Claude Desktop completely
- Reopen Claude Desktop
- Look for weather tools in the interface

### Available Tools

Once connected, Claude.ai will have access to these weather tools:

#### 1. `get_current_weather`
Get current weather data for a location.

**Parameters:**
- `location` (required): Location to get weather for
  - City name: `"New York"`
  - Zipcode: `"10001"`
  - Coordinates: `"40.7128,-74.0060"`
- `country` (optional): Country code for city/zipcode
- `units` (optional): Temperature units (`metric`, `imperial`, `kelvin`)

**Example Usage:**
```
Get the current weather in New York
Get the weather for zipcode 10001 in imperial units
What's the weather at coordinates 40.7128,-74.0060?
```

#### 2. `get_weather_forecast`
Get weather forecast for a location and time span.

**Parameters:**
- `location` (required): Location to get forecast for
- `country` (optional): Country code for city/zipcode
- `days` (optional): Number of days (1-16, default: 5)
- `start_date` (optional): Start date in YYYY-MM-DD format
- `end_date` (optional): End date in YYYY-MM-DD format
- `units` (optional): Temperature units

**Example Usage:**
```
Get a 7-day forecast for London
What's the weather forecast for Tokyo for the next 3 days?
Get the forecast for New York from 2025-10-25 to 2025-10-31
```

#### 3. `get_weather_health`
Check if the weather API is running and healthy.

**Example Usage:**
```
Check if the weather service is working
Is the weather API healthy?
```

## 📊 Response Examples

### Current Weather Response
```json
{
  "success": true,
  "data": {
    "location": {
      "name": "New York",
      "country": "US",
      "coordinates": {
        "lat": 40.7128,
        "lon": -74.0060
      }
    },
    "current": {
      "temperature": 22.5,
      "feelsLike": 25.1,
      "humidity": 65,
      "pressure": 1013,
      "weather": {
        "main": "Clear",
        "description": "clear sky",
        "icon": "01d"
      },
      "wind": {
        "speed": 3.2,
        "direction": 180,
        "gust": null
      },
      "clouds": 0,
      "timestamp": "2024-01-15T12:00:00.000Z"
    }
  },
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

### Weather Forecast Response
```json
{
  "success": true,
  "data": {
    "location": {
      "name": "New York",
      "country": "US",
      "coordinates": {
        "lat": 40.7128,
        "lon": -74.0060
      }
    },
    "timezone": "America/New_York",
    "daily": [
      {
        "date": "2024-01-15",
        "temperature": {
          "max": 25.8,
          "min": 18.2,
          "feelsLikeMax": 28.1,
          "feelsLikeMin": 20.5
        },
        "weather": {
          "main": "Clear",
          "description": "clear sky",
          "icon": "01d"
        },
        "precipitation": {
          "sum": 0,
          "probability": 0
        },
        "wind": {
          "maxSpeed": 5.2,
          "direction": 180
        }
      }
    ],
    "hourly": [
      {
        "timestamp": "2024-01-15T12:00:00.000Z",
        "temperature": {
          "current": 22.5,
          "feelsLike": 25.1
        },
        "humidity": 65,
        "pressure": 1013,
        "weather": {
          "main": "Clear",
          "description": "clear sky",
          "icon": "01d"
        },
        "wind": {
          "speed": 3.2,
          "direction": 180
        }
      }
    ]
  },
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

## 🛠️ Development

### Project Structure

```
weather-mcp/
├── src/
│   ├── services/
│   │   └── WeatherService.js    # Weather API client
│   └── index.js                 # MCP server implementation
├── package.json
├── env.example
└── README.md
```

### Available Scripts

- `npm start`: Start the MCP server
- `npm run dev`: Start development server with auto-restart
- `npm run http`: Start the HTTP API server
- `npm run http-dev`: Start HTTP API with auto-restart
- `npm run cli`: Use the command-line interface

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `WEATHER_API_URL` | Weather API base URL | `http://localhost:3000` |
| `WEATHER_API_TIMEOUT` | API request timeout (ms) | `10000` |
| `HTTP_PORT` | HTTP server port | `3001` |
| `MCP_SERVER_NAME` | MCP server name | `weather-mcp` |
| `MCP_SERVER_VERSION` | MCP server version | `1.0.0` |

## 🔍 Troubleshooting

### Common Issues

1. **"Unable to connect to weather API"**
   - Ensure your weather API is running on the correct port
   - Check the `WEATHER_API_URL` in your `.env` file
   - Verify the weather API is accessible at the configured URL

2. **"Location not found"**
   - Check the location format (city name, zipcode, or coordinates)
   - For international locations, try adding a country code
   - Ensure the location exists and is spelled correctly

3. **MCP Server not connecting to Claude**
   - Verify the path in your Claude Desktop configuration
   - Ensure Node.js is in your system PATH
   - Check that the MCP server starts without errors
   - **Windows users**: Make sure the config is in `%APPDATA%\Roaming\Claude\`


5. **CLI commands not working**
   - Make sure you're in the `weather-mcp` directory
   - Ensure your weather API is running
   - Check that all dependencies are installed with `npm install`

### Debug Mode

To see detailed logs, you can modify the MCP server to include more logging:

```javascript
// Add to src/index.js for debugging
console.error('Weather MCP server starting...');
console.error('Weather API URL:', process.env.WEATHER_API_URL);
```

### Quick Test Commands

**Test your weather API:**
```bash
curl "http://localhost:3000/api/weather/health"
```

**Test the HTTP API:**
```bash
curl "http://localhost:3001/api/weather-health"
```

**Test the CLI:**
```bash
npm run cli health
```

## 📝 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the weather API documentation
3. Ensure both services are running correctly
4. Try the HTTP API first - it's the easiest to set up
5. Check Claude Desktop MCP configuration

## 🎯 **Quick Start Summary**

**For developers - HTTP API:**
```bash
cd weather-mcp
npm install
npm run http
# Use curl or any HTTP client
```

**For power users - CLI:**
```bash
cd weather-mcp
npm install
npm run cli current "New York"
```

**For Claude Desktop - MCP:**
```bash
cd weather-mcp
npm install
npm start
# Configure Claude Desktop with the provided config
```
