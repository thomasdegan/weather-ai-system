# Weather API

## 🌟 Features

### **Core Weather Data**
- **Current Weather**: Get real-time weather data for any location
- **Weather Forecasts**: Get 1-16 day weather forecasts with hourly and daily data
- **Custom Date Ranges**: Specify exact start and end dates for forecasts
- **Historical Data**: Access weather data for specific date ranges

### **Location Support**
- **Coordinates**: Use latitude and longitude for precise locations
- **City Names**: Search by city name with optional country code
- **Zipcodes/Postal Codes**: Support for US and international postal codes
- **Global Coverage**: Weather data for any location worldwide

### **Flexible Units & Formats**
- **Temperature Units**: Celsius (metric), Fahrenheit (imperial), Kelvin
- **Wind Speed**: km/h, mph, m/s
- **Precipitation**: mm, inches
- **Pressure**: hPa, inHg

### **Advanced Features**
- **Timezone Support**: Automatic timezone detection
- **Weather Codes**: Detailed weather condition descriptions
- **Precipitation Data**: Rain, snow, showers with probability
- **Wind Information**: Speed, direction, gusts
- **Atmospheric Data**: Humidity, pressure, cloud cover

### **Developer Experience**
- **Completely Free**: No API key required, no rate limits for personal use
- **RESTful API**: Clean, intuitive endpoints
- **Comprehensive Error Handling**: Meaningful error messages
- **Security**: Built-in security middleware and CORS support
- **OpenAPI Documentation**: Interactive Swagger UI
- **Multiple Response Formats**: JSON with detailed weather data

## Quick Start

### 1. Installation

```bash
npm install
```

### 2. Environment Setup

Copy the example environment file (optional - no API key needed):

```bash
cp env.example .env
```

The default configuration works out of the box:

```env
WEATHER_BASE_URL=https://api.open-meteo.com/v1
PORT=3000
NODE_ENV=development
```

### 3. No API Key Required!

Open-Meteo is completely free and doesn't require any registration or API key. You can start using it immediately!

### 4. Start the Server

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### 5. Access the API Documentation

Visit the interactive Swagger UI documentation:
- **Swagger UI**: `http://localhost:3000/docs`
- **API Root**: `http://localhost:3000/`
- **Health Check**: `http://localhost:3000/api/weather/health`

## 🚀 API Endpoints

### **Current Weather**
Get real-time weather data for any location.

**Endpoint**: `GET /api/weather/current`

**Location Parameters** (choose one):
- `lat` + `lon`: Coordinates (e.g., `lat=40.7128&lon=-74.0060`)
- `city`: City name (e.g., `city=New York`)
- `zipcode`: Postal code (e.g., `zipcode=10001`)

**Optional Parameters**:
- `country`: Country code for city/zipcode (e.g., `country=US`)
- `units`: Temperature units - `metric` (Celsius), `imperial` (Fahrenheit), `kelvin`

**Examples**:
```bash
# By coordinates
curl "http://localhost:3000/api/weather/current?lat=40.7128&lon=-74.0060&units=metric"

# By city name
curl "http://localhost:3000/api/weather/current?city=New York&units=metric"

# By zipcode (US)
curl "http://localhost:3000/api/weather/current?zipcode=10001&units=imperial"

# International location
curl "http://localhost:3000/api/weather/current?city=London&country=GB&units=metric"
```

### **Weather Forecasts**
Get weather forecasts for a location and time span.

**Endpoint**: `GET /api/weather/forecast`

**Location Parameters** (choose one):
- `lat` + `lon`: Coordinates
- `city`: City name  
- `zipcode`: Postal code

**Time Parameters** (choose one):
- `days`: Number of days (1-16, default: 5)
- `start_date` + `end_date`: Custom date range (YYYY-MM-DD format)

**Optional Parameters**:
- `country`: Country code for city/zipcode
- `units`: Temperature units - `metric`, `imperial`, `kelvin`

**Examples**:
```bash
# 5-day forecast by coordinates
curl "http://localhost:3000/api/weather/forecast?lat=40.7128&lon=-74.0060&days=5&units=metric"

# 7-day forecast by zipcode
curl "http://localhost:3000/api/weather/forecast?zipcode=10001&days=7&units=imperial"

# Custom date range (Oct 25-31, 2025)
curl "http://localhost:3000/api/weather/forecast?zipcode=10001&start_date=2025-10-25&end_date=2025-10-31&units=imperial"

# International forecast
curl "http://localhost:3000/api/weather/forecast?city=Tokyo&days=3&units=metric"
```

### **Health Check**
Check if the API is running.

**Endpoint**: `GET /api/weather/health`

**Example**:
```bash
curl "http://localhost:3000/api/weather/health"
```

### **API Documentation**
Interactive API documentation with Swagger UI.

**Endpoint**: `GET /docs`

Visit `http://localhost:3000/docs` in your browser for interactive API documentation.

## 📊 Response Examples

### Current Weather Response

**Endpoint**: `GET /api/weather/current`

**Parameters**:
- `lat` (number): Latitude (required if no city/zipcode)
- `lon` (number): Longitude (required if no city/zipcode)
- `city` (string): City name (required if no lat/lon/zipcode)
- `zipcode` (string): Zipcode/postal code (required if no lat/lon/city)
- `country` (string): Country code (optional, used with city/zipcode)
- `units` (string): Temperature units - `metric`, `imperial`, or `kelvin` (default: `metric`)

**Examples**:

```bash
# By coordinates
curl "http://localhost:3000/api/weather/current?lat=40.7128&lon=-74.0060&units=metric"

# By city name
curl "http://localhost:3000/api/weather/current?city=New York&units=metric"

# By city and country
curl "http://localhost:3000/api/weather/current?city=London&country=GB&units=metric"

# By zipcode (US)
curl "http://localhost:3000/api/weather/current?zipcode=10001&units=imperial"

# By zipcode with country
curl "http://localhost:3000/api/weather/current?zipcode=75001&country=FR&units=metric"
```

**Response**:
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
      "visibility": 10000,
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

### Weather Forecast

Get weather forecast for a location and time span.

**Endpoint**: `GET /api/weather/forecast`

**Parameters**:
- `lat` (number): Latitude (required if no city/zipcode)
- `lon` (number): Longitude (required if no city/zipcode)
- `city` (string): City name (required if no lat/lon/zipcode)
- `zipcode` (string): Zipcode/postal code (required if no lat/lon/city)
- `country` (string): Country code (optional, used with city/zipcode)
- `days` (number): Number of days (1-16, default: 5)
- `start_date` (string): Start date in YYYY-MM-DD format (optional)
- `end_date` (string): End date in YYYY-MM-DD format (optional)
- `units` (string): Temperature units - `metric`, `imperial`, or `kelvin` (default: `metric`)

**Examples**:

```bash
# 5-day forecast by coordinates
curl "http://localhost:3000/api/weather/forecast?lat=40.7128&lon=-74.0060&days=5&units=metric"

# 3-day forecast by city
curl "http://localhost:3000/api/weather/forecast?city=Tokyo&days=3&units=metric"

# 7-day forecast by zipcode (US)
curl "http://localhost:3000/api/weather/forecast?zipcode=10001&days=7&units=imperial"

# 5-day forecast by zipcode with country
curl "http://localhost:3000/api/weather/forecast?zipcode=75001&country=FR&days=5&units=metric"

# Custom date range forecast (Oct 25-31, 2025)
curl "http://localhost:3000/api/weather/forecast?zipcode=10001&start_date=2025-10-25&end_date=2025-10-31&units=imperial"

# Custom date range by city
curl "http://localhost:3000/api/weather/forecast?city=New York&start_date=2025-10-25&end_date=2025-10-31&units=imperial"
```

**Response**:
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
    "forecast": [
      {
        "timestamp": "2024-01-15T12:00:00.000Z",
        "temperature": {
          "current": 22.5,
          "min": 18.2,
          "max": 25.8,
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
          "direction": 180,
          "gust": null
        },
        "clouds": 0,
        "precipitation": {
          "probability": 0,
          "volume": 0
        }
      }
    ]
  },
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

### Health Check

Check if the API is running.

**Endpoint**: `GET /api/weather/health`

**Response**:
```json
{
  "success": true,
  "message": "Weather API is running",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "version": "1.0.0"
}
```

## Error Handling

The API provides comprehensive error handling with meaningful error messages:

- **400 Bad Request**: Invalid parameters or missing required fields
- **404 Not Found**: Location not found
- **500 Internal Server Error**: Server or API configuration issues

**Error Response Format**:
```json
{
  "error": "Bad Request",
  "message": "Either city or both lat and lon parameters are required"
}
```

## Development

### Project Structure

```
weather-api/
├── src/
│   ├── services/
│   │   └── WeatherService.js    # Weather service implementation
│   ├── routes/
│   │   └── weatherRoutes.js     # API route handlers
│   └── index.js                 # Main application file
├── package.json
├── env.example
└── README.md
```

### Available Scripts

- `npm start`: Start the production server
- `npm run dev`: Start development server with auto-restart
- `npm test`: Run tests (when implemented)

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `WEATHER_BASE_URL` | Open-Meteo API base URL | `https://api.open-meteo.com/v1` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |

**Note**: No API key is required for Open-Meteo!

### Temperature Units

- **metric**: Celsius (°C)
- **imperial**: Fahrenheit (°F)
- **kelvin**: Kelvin (K)

## License

MIT License
