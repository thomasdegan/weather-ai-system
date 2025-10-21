# Weather AI System Architecture

## 🌟 **System Overview**

This is a complete weather AI system that combines multiple technologies to provide intelligent weather assistance through natural language. The system consists of three main components working together to deliver weather data through AI-powered interfaces.

## 🏗️ **System Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   BlockNote UI  │───▶│ Claude Proxy    │───▶│ MCP Server      │───▶│ Weather API     │
│   (Frontend)    │    │ (AI Processing) │    │ (Data Layer)     │    │ (Data Source)   │
└─────────────────┘    └─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🔄 **Data Flow**

### **1. User Interaction (BlockNote UI)**
- **User Input**: Natural language weather queries
- **Examples**: 
  - "What's the weather in Paris?"
  - "Compare weather in Miami vs Seattle"
  - "Give me a 5-day forecast for Tokyo"
- **Interface**: React-based BlockNote editor with Claude AI integration

### **2. AI Processing (Claude Proxy Server)**
- **Port**: 3003
- **Role**: Natural language understanding and tool orchestration
- **Process**:
  1. Receives user's natural language request
  2. Claude AI analyzes the request and determines required tools
  3. Calls appropriate MCP server endpoints
  4. Formats response for user

### **3. Data Layer (MCP Server)**
- **Port**: 3001
- **Role**: Standardized API interface and parameter handling
- **Process**:
  1. Receives structured requests from Claude proxy
  2. Validates parameters (location, units, dates)
  3. Calls Weather API with proper parameters
  4. Returns standardized responses

### **4. Data Source (Weather API)**
- **Port**: 3000
- **Role**: Core weather data provider
- **Process**:
  1. Receives validated requests from MCP server
  2. Calls external weather service (OpenWeatherMap)
  3. Returns raw weather data
  4. Handles caching and rate limiting

## 🛠️ **Component Details**

### **BlockNote UI (Frontend)**
- **Technology**: React + BlockNote + Tailwind CSS
- **Purpose**: Rich text editor interface with AI integration
- **Features**:
  - Natural language weather queries
  - Formatted weather responses
  - Multiple interface options (Claude AI, Simple AI, Form-based)
  - Real-time weather data display

### **Claude Proxy Server (AI Layer)**
- **Technology**: Express.js + Anthropic Claude AI
- **Purpose**: Natural language processing and tool orchestration
- **Features**:
  - Claude AI integration for natural language understanding
  - Tool definitions for weather operations
  - Location parsing and parameter extraction
  - Response formatting and conversation management

### **MCP Server (Data Layer)**
- **Technology**: Express.js + Model Context Protocol
- **Purpose**: Standardized API interface and parameter validation
- **Features**:
  - HTTP API endpoints (`/api/current`, `/api/forecast`)
  - Parameter validation and error handling
  - Location parsing (coordinates, city, zipcode)
  - Consistent response formatting

### **Weather API (Data Source)**
- **Technology**: Express.js + OpenWeatherMap API
- **Purpose**: Core weather data provider
- **Features**:
  - Current weather data
  - Weather forecasts (1-16 days)
  - Multiple location formats
  - Unit conversion (metric, imperial, kelvin)
  - Health monitoring

## 🔧 **Configuration & Environment**

### **Required Services**
1. **Weather API** (Port 3000) - Core data source
2. **MCP Server** (Port 3001) - Data layer
3. **Claude Proxy** (Port 3003) - AI processing
4. **BlockNote UI** (Port 3002) - Frontend interface

### **Environment Variables**
```bash
# Weather API
OPENWEATHER_API_KEY=your_api_key_here

# Claude Proxy
ANTHROPIC_API_KEY=your_anthropic_key_here
WEATHER_API_URL=http://localhost:3001

# MCP Server
WEATHER_API_URL=http://localhost:3000
```

## 🚀 **Startup Sequence**

### **1. Start Weather API**
```bash
cd weather-api
npm start
# Runs on http://localhost:3000
```

### **2. Start MCP Server**
```bash
cd weather-mcp
npm run http
# Runs on http://localhost:3001
```

### **3. Start Claude Proxy**
```bash
cd blocknoteUI
npm run proxy
# Runs on http://localhost:3003
```

### **4. Start BlockNote UI**
```bash
cd blocknoteUI
npm run dev
# Runs on http://localhost:3002
```

## 💬 **Example User Journey**

### **User Query**: "What's the weather in Paris, France?"

1. **BlockNote UI** → User types query in editor
2. **Claude Proxy** → Receives: "What's the weather in Paris, France?"
3. **Claude AI** → Analyzes and calls `get_current_weather` tool
4. **MCP Server** → Receives: `GET /api/current?city=Paris&country=France&units=metric`
5. **Weather API** → Calls OpenWeatherMap API
6. **Response Chain** → Weather API → MCP Server → Claude Proxy → BlockNote UI
7. **User Sees** → Formatted weather response with temperature, conditions, etc.

## 🔄 **Advanced Features**

### **Weather Comparison**
- **Query**: "Compare weather in Miami vs Seattle"
- **Process**: Claude AI calls `compare_weather` tool
- **Result**: Side-by-side weather comparison

### **Date Range Forecasts**
- **Query**: "What's the weather in New Orleans from 10/30/2025-11/1/2025"
- **Process**: Claude AI calls `get_weather_forecast` with date range
- **Result**: Multi-day forecast for specified period

### **Multiple Location Formats**
- **City**: "New York", "London"
- **Coordinates**: "40.7128,-74.0060"
- **Zipcode**: "10001", "75001"
- **City + Country**: "Paris, France"

## 🛡️ **Error Handling**

### **Layer-by-Layer Error Handling**
1. **Weather API** → Validates API keys, handles rate limits
2. **MCP Server** → Validates parameters, handles location parsing
3. **Claude Proxy** → Handles AI errors, formats error responses
4. **BlockNote UI** → Displays user-friendly error messages

### **Fallback Mechanisms**
- API key validation
- Network timeout handling
- Graceful degradation
- User-friendly error messages

## 📊 **Performance Considerations**

### **Caching**
- Weather API implements response caching
- MCP server can add additional caching layers
- Claude proxy handles conversation context

### **Rate Limiting**
- OpenWeatherMap API rate limits
- MCP server can implement additional rate limiting
- Claude AI has its own rate limits

### **Scalability**
- Each component can be scaled independently
- Load balancing possible at each layer
- Microservices architecture allows for easy deployment

## 🔍 **Monitoring & Health Checks**

### **Health Endpoints**
- **Weather API**: `GET /api/weather-health`
- **MCP Server**: `GET /health`
- **Claude Proxy**: `GET /health`
- **BlockNote UI**: Built-in Vite health monitoring

### **Logging**
- Each component logs requests and responses
- Error tracking and debugging information
- Performance metrics and timing

## 🎯 **Key Benefits**

1. **Natural Language Interface**: Users can ask weather questions in plain English
2. **Intelligent Processing**: Claude AI understands context and intent
3. **Flexible Architecture**: Each component can be updated independently
4. **Rich User Experience**: BlockNote editor provides rich text formatting
5. **Comprehensive Coverage**: Current weather, forecasts, comparisons
6. **Error Resilience**: Multiple layers of error handling and validation

## 🔧 **Development & Testing**

### **Testing Strategy**
- Unit tests for each component
- Integration tests for API endpoints
- End-to-end tests for user workflows
- Health checks for all services

### **Development Workflow**
1. Start all services in development mode
2. Use hot reloading for frontend changes
3. Test each component independently
4. Verify end-to-end functionality

This architecture provides a robust, scalable, and user-friendly weather AI system that combines the power of modern AI with reliable weather data services.
