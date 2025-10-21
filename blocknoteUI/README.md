# Weather Forecast UI - Claude AI Integration

A beautiful React-based weather forecast interface with Claude AI integration for natural language weather queries. Users can ask questions in natural language and get AI-powered weather responses with rich text formatting.

## 🌟 Features

### **Claude AI Integration**
- **Natural Language Processing**: Ask weather questions in plain English
- **AI-Powered Responses**: Claude AI understands and responds to weather queries
- **Rich Text Editor**: BlockNote editor for beautifully formatted weather reports
- **Real-time Weather Data**: Live weather data from Open-Meteo API
- **Multiple Query Types**: Current weather, forecasts, and comparisons

### **Natural Language Interface**
- **Plain English Queries**: "What's the weather in New York?"
- **Flexible Questions**: "Give me a 5-day forecast for London"
- **Comparison Queries**: "Compare weather in New York vs Los Angeles"
- **Smart Location Parsing**: AI understands cities, zipcodes, and coordinates

### **Rich Response Formatting**
- **Structured Reports**: Headers, paragraphs, and formatted data
- **Visual Icons**: Weather condition icons and indicators
- **Temperature Display**: High/low temperatures with units
- **Wind & Humidity**: Detailed atmospheric data
- **Precipitation**: Rain and snow probability

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- Anthropic API key for Claude AI
- Your weather API running (see `../weather-api/README.md`)
- Your weather MCP HTTP server running (see `../weather-mcp/README.md`)

### 2. Installation

```bash
cd blocknoteUI
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
VITE_WEATHER_API_URL=http://localhost:3001

# Claude AI Configuration
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
VITE_CLAUDE_PROXY_URL=http://localhost:3003

# Development Configuration
VITE_DEV_MODE=true

# Server Environment Variables (for proxy server)
ANTHROPIC_API_KEY=your_anthropic_api_key_here
WEATHER_API_URL=http://localhost:3001
CLAUDE_PROXY_PORT=3003
```

### 4. Start All Services

**Start the Claude Proxy Server:**
```bash
npm run proxy
```

**Start the Development Server:**
```bash
npm run dev
```

**Open your browser:** `http://localhost:3002`

## 🎯 Usage

### **Asking Weather Questions**

1. **Type Your Question**: Use natural language
   - "What's the weather in New York?"
   - "Give me a 5-day forecast for London"
   - "How's the weather in 10001?"
   - "Compare the weather in New York vs Los Angeles"

2. **Click "Ask Claude"**: The AI will process your request

3. **View AI Response**: Get beautifully formatted weather information

### **Viewing Results**

The AI response appears in the interface:

1. **AI Response**: Claude's natural language weather response
2. **Rich Text Editor**: Beautifully formatted weather report
3. **Real-time Data**: Live weather information from the API

## 🎨 Interface Overview

### **Main Interface**
- **Natural Language Input**: Text area for weather questions
- **AI Response Display**: Claude's formatted weather responses
- **Rich Text Editor**: BlockNote editor for detailed reports
- **Loading States**: Visual feedback during AI processing

## 🔧 Configuration

### **Environment Variables**

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_WEATHER_API_URL` | Weather MCP HTTP server URL | `http://localhost:3001` |
| `VITE_ANTHROPIC_API_KEY` | Anthropic API key for Claude AI | Required |
| `VITE_CLAUDE_PROXY_URL` | Claude proxy server URL | `http://localhost:3003` |
| `ANTHROPIC_API_KEY` | Server-side Anthropic API key | Required |
| `WEATHER_API_URL` | Weather API URL for proxy | `http://localhost:3001` |
| `CLAUDE_PROXY_PORT` | Claude proxy server port | `3003` |
| `VITE_DEV_MODE` | Development mode flag | `true` |

### **Available Scripts**

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm start`: Start with host access
- `npm run proxy`: Start Claude proxy server
- `npm run proxy-dev`: Start proxy server with auto-restart

## 🏗️ Architecture

### **Component Structure**

```
src/
├── components/
│   ├── WeatherRequestForm.jsx    # Request form component
│   └── WeatherResponse.jsx       # Response display component
├── services/
│   ├── WeatherService.js         # Weather API integration
│   ├── ClaudeService.js          # Claude AI integration
│   └── ClaudeProxy.js            # Claude proxy client
├── AppClaude.jsx                 # Main Claude AI application
├── main.jsx                      # Application entry point
├── claude-proxy-server.js        # Claude proxy server
└── index.css                     # Styling and themes
```

### **Data Flow**

1. **User Input** → Natural Language Query
2. **Query Processing** → Claude AI via Proxy Server
3. **AI Analysis** → Weather API Integration
4. **Response Generation** → Formatted Weather Data
5. **Display** → BlockNote Editor + AI Response

## 🎨 Styling & Theming

### **Weather Theme**
- **Primary Colors**: Blue gradient backgrounds
- **Weather Icons**: Lucide React icons
- **Cards**: Glass-morphism design
- **Typography**: Inter font family

### **Responsive Design**
- **Mobile**: Single column layout
- **Tablet**: Two-column layout
- **Desktop**: Full feature layout

## 🔍 Troubleshooting

### **Common Issues**

1. **"Unable to connect to weather API"**
   - Ensure your weather API is running on port 3001
   - Ensure your weather MCP HTTP server is running on port 3002
   - Ensure your Claude proxy server is running on port 3003
   - Check all URLs in your `.env` file

2. **"Location not found"**
   - Check the location format (city name, zipcode, or coordinates)
   - For international locations, try adding a country code
   - Ensure the location exists and is spelled correctly

3. **Claude AI not responding**
   - Check that your Anthropic API key is valid
   - Ensure the Claude proxy server is running on port 3003
   - Check browser console for CORS errors
   - Verify all environment variables are set correctly

4. **Styling issues**
   - Clear browser cache
   - Check if Tailwind CSS is loading properly
   - Verify all CSS files are included

### **Development Tips**

**Hot Reload**: The development server supports hot reload for instant updates

**Debug Mode**: Check browser console for detailed error messages

**Network Tab**: Monitor API calls in browser developer tools

## 📊 API Integration

### **Weather Service Methods**

```javascript
// Get current weather
const currentWeather = await weatherService.getCurrentWeather(
  'New York',     // location
  'US',           // country (optional)
  'metric'        // units
)

// Get forecast
const forecast = await weatherService.getForecast(
  'London',       // location
  'GB',           // country (optional)
  7,              // days
  'metric',       // units
  '2024-01-15',  // start date (optional)
  '2024-01-22'   // end date (optional)
)
```

### **Response Formatting**

The BlockNote editor receives structured content blocks:

```javascript
const blocks = [
  {
    type: 'heading',
    props: { level: 1 },
    content: '🌤️ Weather Report for New York'
  },
  {
    type: 'paragraph',
    content: '🌡️ Temperature: 22°C'
  }
  // ... more blocks
]
```

## 🚀 Deployment

### **Production Build**

```bash
npm run build
```

### **Preview Production**

```bash
npm run preview
```

### **Environment Configuration**

For production, update your environment variables:

```env
VITE_WEATHER_API_URL=https://your-weather-api.com
VITE_DEV_MODE=false
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
3. Ensure all services are running correctly
4. Check browser console for errors

## 🎯 **Quick Start Summary**

**Start all services:**
```bash
# Terminal 1: Weather API
cd weather-api
npm start

# Terminal 2: Weather MCP HTTP Server
cd weather-mcp
npm run http

# Terminal 3: Claude Proxy Server
cd blocknoteUI
npm run proxy

# Terminal 4: BlockNote UI
cd blocknoteUI
npm run dev
```

**Open:** `http://localhost:3002`
