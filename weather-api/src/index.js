import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger.js';
import weatherRoutes from './routes/weatherRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || false
    : true,
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Swagger documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Weather API Documentation'
}));

// API routes
app.use('/api/weather', weatherRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Weather API Service',
    version: '1.0.0',
    endpoints: {
      current: '/api/weather/current',
      forecast: '/api/weather/forecast',
      health: '/api/weather/health'
    },
    documentation: {
      current: {
        method: 'GET',
        description: 'Get current weather for a location',
        parameters: {
          lat: 'Latitude (required if no city)',
          lon: 'Longitude (required if no city)',
          city: 'City name (required if no lat/lon)',
          country: 'Country code (optional)',
          units: 'Temperature units: metric, imperial, kelvin (default: metric)'
        }
      },
      forecast: {
        method: 'GET',
        description: 'Get weather forecast for a location and time span',
        parameters: {
          lat: 'Latitude (required if no city)',
          lon: 'Longitude (required if no city)',
          city: 'City name (required if no lat/lon)',
          country: 'Country code (optional)',
          days: 'Number of days (1-5, default: 5)',
          units: 'Temperature units: metric, imperial, kelvin (default: metric)'
        }
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableEndpoints: [
      'GET /',
      'GET /api/weather/current',
      'GET /api/weather/forecast',
      'GET /api/weather/health'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : error.message,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🌤️  Weather API server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/weather/health`);
  console.log(`📖 API documentation: http://localhost:${PORT}/`);
  console.log(`🆓 Using Open-Meteo (completely free, no API key required)`);
});

export default app;
