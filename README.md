# Weather AI System - Complete Setup Guide

A comprehensive weather system with Claude AI integration, featuring a REST API, MCP server, and beautiful React UI. Ask weather questions in natural language and get AI-powered responses with rich formatting.

## 🌟 System Overview

This project consists of four interconnected services:

1. **🌤️ Weather API** - REST API connecting to Open-Meteo for weather data
2. **🔗 Weather MCP Server** - Model Context Protocol server with multiple interfaces
3. **🤖 Claude AI Integration** - Natural language processing for weather queries
4. **🎨 BlockNote UI** - Beautiful React interface with rich text editing

## 🚀 Quick Start (All Services)

### Prerequisites

- **Node.js 18+** installed
- **Anthropic API Key** for Claude AI ([Get one here](https://console.anthropic.com/))
- **Git** for cloning the repository

### 1. Clone and Setup

```bash
git clone https://github.com/thomasdegan/weather-ai-system.git
cd weather-ai-system
```

### 2. Install Dependencies

```bash
# Install Weather API dependencies
cd weather-api
npm install

# Install Weather MCP dependencies
cd ../weather-mcp
npm install

# Install BlockNote UI dependencies
cd ../blocknoteUI
npm install
```

### 3. Configure Environment Variables

**Weather API** (optional - works out of the box):
```bash
cd weather-api
cp env.example .env
# Edit .env if needed (defaults work fine)
```

**Weather MCP Server**:
```bash
cd weather-mcp
cp env.example .env
# Edit .env to match your setup
```

**BlockNote UI with Claude AI**:
```bash
cd blocknoteUI
cp env.example .env
# Edit .env with your Anthropic API key
```

**Required .env configuration for blocknoteUI:**
```env
# Claude AI Configuration
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
VITE_CLAUDE_PROXY_URL=http://localhost:3003

# Server Environment Variables (for proxy server)
ANTHROPIC_API_KEY=your_anthropic_api_key_here
WEATHER_API_URL=http://localhost:3001
CLAUDE_PROXY_PORT=3003
```

### 4. Start All Services

**Open 4 terminal windows/tabs:**

**Terminal 1 - Weather API:**
```bash
cd weather-api
npm start
```
✅ Weather API running on `http://localhost:3000`

**Terminal 2 - Weather MCP HTTP Server:**
```bash
cd weather-mcp
npm run http
```
✅ Weather MCP HTTP Server running on `http://localhost:3001`

**Terminal 3 - Claude Proxy Server:**
```bash
cd blocknoteUI
npm run proxy
```
✅ Claude Proxy Server running on `http://localhost:3003`

**Terminal 4 - BlockNote UI:**
```bash
cd blocknoteUI
npm run dev
```
✅ BlockNote UI running on `http://localhost:3002`

### 5. Access the System

**Open your browser:** `http://localhost:3002`

**Try these natural language queries:**
- "What's the weather in New York?"
- "Give me a 5-day forecast for London"
- "How's the weather in 10001?"
- "Compare the weather in New York vs Los Angeles"
- "Are there any weather alerts in Miami?"
- "What weather warnings are active in New York?"
- "Show me weather alerts for London, UK"

## 📊 Service Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   BlockNote UI  │    │  Claude Proxy   │    │   Weather API   │
│   (Port 3002)   │◄──►│   (Port 3003)   │◄──►│   (Port 3000)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  User Interface │    │   Claude AI     │    │   Open-Meteo    │
│  Natural Lang   │    │   Processing    │    │   Weather Data   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Individual Service Setup

### Weather API Setup

**Purpose:** REST API providing weather data from Open-Meteo

**Quick Start:**
```bash
cd weather-api
npm install
npm start
```

**Features:**
- Current weather and forecasts
- No API key required
- Swagger documentation at `http://localhost:3000/docs`

**See:** [weather-api/README.md](weather-api/README.md) for detailed documentation

### Weather MCP Server Setup

**Purpose:** Model Context Protocol server with multiple interfaces

**Quick Start:**
```bash
cd weather-mcp
npm install
npm run http  # HTTP API
# OR
npm start  # MCP server for Claude Desktop
# OR
npm run cli  # CLI tool
```

**Features:**
- HTTP API endpoints
- CLI tool for command-line usage
- MCP integration for Claude Desktop

**See:** [weather-mcp/README.md](weather-mcp/README.md) for detailed documentation

### BlockNote UI Setup

**Purpose:** React UI with Claude AI integration for natural language weather queries

**Quick Start:**
```bash
cd blocknoteUI
npm install
# Configure .env with your Anthropic API key
npm run proxy  # Start Claude proxy server
npm run dev    # Start React UI
```

**Features:**
- Natural language weather queries
- Claude AI integration
- Rich text editor with BlockNote
- Beautiful weather formatting

**See:** [blocknoteUI/README.md](blocknoteUI/README.md) for detailed documentation

## 🎯 Usage Examples

### Natural Language Queries

**Current Weather:**
- "What's the weather in Washington, DC?"
- "How's the weather in 10001?"
- "What's the temperature in London?"

**Forecasts:**
- "Give me a 5-day forecast for Tokyo"
- "What's the weather forecast for New York this week?"
- "Show me the weather in Paris for the next 3 days"

**Comparisons:**
- "Compare the weather in New York vs Los Angeles"
- "Which city is warmer: Miami or Seattle?"

### API Endpoints

**Weather API:**
```bash
# Current weather
curl "http://localhost:3000/api/weather/current?city=New York&units=metric"

# Forecast
curl "http://localhost:3000/api/weather/forecast?city=London&days=5&units=metric"

# Weather alerts
curl "http://localhost:3000/api/weather/alerts?city=Miami"
```

**Weather MCP HTTP API:**
```bash
# Current weather
curl "http://localhost:3001/api/current?location=New York&units=metric"

# Forecast
curl "http://localhost:3001/api/forecast?location=London&days=5&units=metric"

# Weather alerts
curl "http://localhost:3001/api/alerts?location=Miami"
```

## 🔍 Troubleshooting

### Common Issues

**1. "Unable to connect to weather API"**
- Ensure Weather API is running on port 3000
- Check that all services are started in the correct order
- Verify environment variables are set correctly

**2. "Claude AI not responding"**
- Check your Anthropic API key is valid
- Ensure Claude proxy server is running on port 3003
- Check browser console for CORS errors

**3. "Location not found"**
- Try different location formats (city name, zipcode, coordinates)
- For international locations, try adding country codes
- Ensure the location exists and is spelled correctly

**4. Port conflicts**
- Weather API: port 3000
- Weather MCP HTTP: port 3001
- Claude Proxy: port 3003
- BlockNote UI: port 3002 (Vite dev server)

### Service Health Checks

**Check all services are running:**
```bash
# Weather API
curl http://localhost:3000/api/weather/health

# Weather MCP HTTP Server
curl http://localhost:3001/api/weather-health

# Claude Proxy Server
curl http://localhost:3003/health
```

## 🛠️ Development

### Project Structure

```
weather/
├── weather-api/           # REST API for weather data
│   ├── src/
│   │   ├── services/     # Weather service implementation
│   │   ├── routes/       # API route handlers
│   │   └── index.js      # Main application
│   ├── package.json
│   └── README.md
├── weather-mcp/          # MCP server with multiple interfaces
│   ├── src/
│   │   ├── services/     # Weather API client
│   │   ├── index.js      # MCP server
│   │   ├── http-server.js # HTTP API server
│   │   └── cli.js        # Command line interface
│   ├── package.json
│   └── README.md
├── blocknoteUI/          # React UI with Claude AI
│   ├── src/
│   │   ├── services/     # API integration services
│   │   ├── components/   # React components
│   │   ├── AppClaude.jsx # Main Claude AI app
│   │   └── claude-proxy-server.js # Claude proxy server
│   ├── package.json
│   └── README.md
└── README.md             # This file
```

### Development Scripts

**Weather API:**
```bash
cd weather-api
npm run dev  # Development with auto-restart
npm test     # Run tests
```

**Weather MCP:**
```bash
cd weather-mcp
npm run http-dev   # HTTP API with auto-restart
```

**BlockNote UI:**
```bash
cd blocknoteUI
npm run dev        # React dev server
npm run proxy-dev  # Claude proxy with auto-restart
npm run build      # Production build
```

## 📝 Configuration

### Environment Variables Summary

**Weather API** (`weather-api/.env`):
```env
WEATHER_BASE_URL=https://api.open-meteo.com/v1
PORT=3000
NODE_ENV=development
```

**Weather MCP** (`weather-mcp/.env`):
```env
WEATHER_API_URL=http://localhost:3000
WEATHER_API_TIMEOUT=10000
HTTP_PORT=3002
MCP_SERVER_NAME=weather-mcp
MCP_SERVER_VERSION=1.0.0
```

**BlockNote UI** (`blocknoteUI/.env`):
```env
# Frontend
VITE_WEATHER_API_URL=http://localhost:3002
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key
VITE_CLAUDE_PROXY_URL=http://localhost:3003
VITE_DEV_MODE=true

# Backend (Claude Proxy)
ANTHROPIC_API_KEY=your_anthropic_api_key
WEATHER_API_URL=http://localhost:3001
CLAUDE_PROXY_PORT=3003
```

## 🚀 Deployment

### Production Build

**Weather API:**
```bash
cd weather-api
npm start
```

**Weather MCP:**
```bash
cd weather-mcp
npm run http  # HTTP API mode
```

**BlockNote UI:**
```bash
cd blocknoteUI
npm run build
npm run preview
```

### Docker Support (Optional)

Each service can be containerized:

```dockerfile
# Example Dockerfile for Weather API
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 API Documentation

### Weather API Endpoints

- **Current Weather:** `GET /api/weather/current`
- **Weather Forecast:** `GET /api/weather/forecast`
- **Weather Alerts:** `GET /api/weather/alerts`
- **Health Check:** `GET /api/weather/health`
- **API Docs:** `http://localhost:3000/docs`

### Weather MCP HTTP Endpoints

- **Current Weather:** `GET /api/current`
- **Weather Forecast:** `GET /api/forecast`
- **Weather Alerts:** `GET /api/alerts`
- **Health Check:** `GET /api/weather-health`

### Claude AI Integration

- **Weather Query:** `POST /api/claude/weather`
- **Natural Language Processing:** Claude AI understands weather questions
- **Tool Integration:** Weather API tools available to Claude

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with all services
5. Submit a pull request

## 📞 Support

**For issues and questions:**

1. Check the troubleshooting section above
2. Review individual service README files
3. Ensure all services are running correctly
4. Check browser console for errors
5. Verify environment variables are set correctly

**Service-specific documentation:**
- [Weather API Documentation](weather-api/README.md)
- [Weather MCP Documentation](weather-mcp/README.md)
- [BlockNote UI Documentation](blocknoteUI/README.md)

## 📄 License

MIT License

## 🔗 Repository

- **GitHub:** [https://github.com/YOUR_USERNAME/weather-ai-system](https://github.com/YOUR_USERNAME/weather-ai-system)
- **Issues:** [Report bugs or request features](https://github.com/YOUR_USERNAME/weather-ai-system/issues)
- **Pull Requests:** [Contribute to the project](https://github.com/YOUR_USERNAME/weather-ai-system/pulls)

> **Note:** Replace `YOUR_USERNAME` with your actual GitHub username.

## 🎯 Quick Reference

**Start all services:**
```bash
# Terminal 1
cd weather-api && npm start

# Terminal 2  
cd weather-mcp && npm run http

# Terminal 3
cd blocknoteUI && npm run proxy

# Terminal 4
cd blocknoteUI && npm run dev
```

**Access points:**
- **BlockNote UI:** `http://localhost:3002`
- **Weather API Docs:** `http://localhost:3000/docs`
- **Weather MCP HTTP:** `http://localhost:3001`

**Test queries:**
- "What's the weather in New York?"
- "Give me a 5-day forecast for London"
- "Compare weather in Miami vs Seattle"
