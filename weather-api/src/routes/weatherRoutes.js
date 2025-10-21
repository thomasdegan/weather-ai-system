import express from 'express';
import { WeatherService } from '../services/WeatherService.js';

const router = express.Router();
const weatherService = new WeatherService();

/**
 * @swagger
 * /api/weather/current:
 *   get:
 *     summary: Get current weather for a location
 *     description: Retrieve real-time weather data for any location using coordinates, city name, or zipcode
 *     tags: [Weather]
 *     parameters:
 *       - $ref: '#/components/parameters/Latitude'
 *       - $ref: '#/components/parameters/Longitude'
 *       - $ref: '#/components/parameters/City'
 *       - $ref: '#/components/parameters/Zipcode'
 *       - $ref: '#/components/parameters/Country'
 *       - $ref: '#/components/parameters/Units'
 *     responses:
 *       200:
 *         description: Current weather data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         location:
 *                           $ref: '#/components/schemas/Location'
 *                         current:
 *                           $ref: '#/components/schemas/CurrentWeather'
 *       400:
 *         description: Bad request - invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Location not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/current', async (req, res) => {
  try {
    const { lat, lon, city, zipcode, country, units = 'metric' } = req.query;

    // Validate required parameters
    if (!city && !zipcode && (!lat || !lon)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Either city, zipcode, or both lat and lon parameters are required'
      });
    }

    // Check for conflicting parameters
    const locationParams = [city, zipcode, (lat && lon ? 'coordinates' : null)].filter(Boolean);
    if (locationParams.length > 1) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Provide only one location parameter: city, zipcode, or lat/lon coordinates'
      });
    }

    // Validate units parameter
    const validUnits = ['metric', 'imperial', 'kelvin'];
    if (!validUnits.includes(units)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Units must be one of: metric, imperial, kelvin'
      });
    }

    let weatherData;

    if (zipcode) {
      weatherData = await weatherService.getCurrentWeatherByZipcode(zipcode, country, units);
    } else if (city) {
      weatherData = await weatherService.getCurrentWeatherByCity(city, country, units);
    } else {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);

      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Latitude and longitude must be valid numbers'
        });
      }

      if (latitude < -90 || latitude > 90) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Latitude must be between -90 and 90'
        });
      }

      if (longitude < -180 || longitude > 180) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Longitude must be between -180 and 180'
        });
      }

      weatherData = await weatherService.getCurrentWeather(latitude, longitude, units);
    }

    res.json({
      success: true,
      data: weatherData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Current weather error:', error);
    
    if (error.message.includes('Location not found')) {
      return res.status(404).json({
        error: 'Not Found',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/weather/forecast:
 *   get:
 *     summary: Get weather forecast for a location and time span
 *     description: Retrieve weather forecasts for any location using coordinates, city name, or zipcode. Supports both day count and custom date ranges.
 *     tags: [Weather]
 *     parameters:
 *       - $ref: '#/components/parameters/Latitude'
 *       - $ref: '#/components/parameters/Longitude'
 *       - $ref: '#/components/parameters/City'
 *       - $ref: '#/components/parameters/Zipcode'
 *       - $ref: '#/components/parameters/Country'
 *       - $ref: '#/components/parameters/Days'
 *       - $ref: '#/components/parameters/StartDate'
 *       - $ref: '#/components/parameters/EndDate'
 *       - $ref: '#/components/parameters/Units'
 *     responses:
 *       200:
 *         description: Weather forecast data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         location:
 *                           $ref: '#/components/schemas/Location'
 *                         timezone:
 *                           type: string
 *                           description: Location timezone
 *                           example: 'America/New_York'
 *                         daily:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/DailyForecast'
 *                         hourly:
 *                           type: array
 *                           description: Hourly forecast data for the first day
 *                           items:
 *                             type: object
 *                             properties:
 *                               timestamp:
 *                                 type: string
 *                                 format: date-time
 *                               temperature:
 *                                 type: object
 *                                 properties:
 *                                   current:
 *                                     type: number
 *                                   feelsLike:
 *                                     type: number
 *                               humidity:
 *                                 type: number
 *                               pressure:
 *                                 type: number
 *                               weather:
 *                                 type: object
 *                                 properties:
 *                                   main:
 *                                     type: string
 *                                   description:
 *                                     type: string
 *                                   icon:
 *                                     type: string
 *                               wind:
 *                                 type: object
 *                                 properties:
 *                                   speed:
 *                                     type: number
 *                                   direction:
 *                                     type: number
 *                                   gust:
 *                                     type: number
 *                               clouds:
 *                                 type: number
 *                               precipitation:
 *                                 type: object
 *                                 properties:
 *                                   rain:
 *                                     type: number
 *                                   showers:
 *                                     type: number
 *                                   snowfall:
 *                                     type: number
 *       400:
 *         description: Bad request - invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Location not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/forecast', async (req, res) => {
  try {
    const { lat, lon, city, zipcode, country, days = 5, start_date, end_date, units = 'metric' } = req.query;

    // Validate required parameters
    if (!city && !zipcode && (!lat || !lon)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Either city, zipcode, or both lat and lon parameters are required'
      });
    }

    // Check for conflicting parameters
    const locationParams = [city, zipcode, (lat && lon ? 'coordinates' : null)].filter(Boolean);
    if (locationParams.length > 1) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Provide only one location parameter: city, zipcode, or lat/lon coordinates'
      });
    }

    // Validate days parameter
    const daysNum = parseInt(days);
    if (isNaN(daysNum) || daysNum < 1 || daysNum > 16) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Days must be a number between 1 and 16'
      });
    }

    // Validate units parameter
    const validUnits = ['metric', 'imperial', 'kelvin'];
    if (!validUnits.includes(units)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Units must be one of: metric, imperial, kelvin'
      });
    }

    let forecastData;

    if (zipcode) {
      forecastData = await weatherService.getForecastByZipcode(zipcode, country, daysNum, units, start_date, end_date);
    } else if (city) {
      forecastData = await weatherService.getForecastByCity(city, country, daysNum, units, start_date, end_date);
    } else {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);

      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Latitude and longitude must be valid numbers'
        });
      }

      if (latitude < -90 || latitude > 90) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Latitude must be between -90 and 90'
        });
      }

      if (longitude < -180 || longitude > 180) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Longitude must be between -180 and 180'
        });
      }

      forecastData = await weatherService.getForecast(latitude, longitude, daysNum, units, start_date, end_date);
    }

    res.json({
      success: true,
      data: forecastData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Forecast error:', error);
    
    if (error.message.includes('Location not found')) {
      return res.status(404).json({
        error: 'Not Found',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/weather/alerts:
 *   get:
 *     summary: Get weather alerts for a location
 *     description: Retrieve weather alerts and warnings for any location using coordinates, city name, or zipcode
 *     tags: [Weather]
 *     parameters:
 *       - $ref: '#/components/parameters/Latitude'
 *       - $ref: '#/components/parameters/Longitude'
 *       - $ref: '#/components/parameters/City'
 *       - $ref: '#/components/parameters/Zipcode'
 *       - $ref: '#/components/parameters/Country'
 *     responses:
 *       200:
 *         description: Weather alerts data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         location:
 *                           $ref: '#/components/schemas/Location'
 *                         alerts:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               event:
 *                                 type: string
 *                                 description: Alert event name
 *                                 example: 'Heat Warning'
 *                               description:
 *                                 type: string
 *                                 description: Detailed alert description
 *                               onset:
 *                                 type: string
 *                                 format: date-time
 *                                 description: Alert start time
 *                               expires:
 *                                 type: string
 *                                 format: date-time
 *                                 description: Alert expiration time
 *                               severity:
 *                                 type: string
 *                                 description: Alert severity level
 *                                 example: 'Moderate'
 *                               certainty:
 *                                 type: string
 *                                 description: Alert certainty level
 *                                 example: 'Likely'
 *                               urgency:
 *                                 type: string
 *                                 description: Alert urgency level
 *                                 example: 'Immediate'
 *                               areas:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                                 description: Affected areas
 *                               tags:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                                 description: Alert tags
 *                         alertCount:
 *                           type: number
 *                           description: Number of active alerts
 *                         hasAlerts:
 *                           type: boolean
 *                           description: Whether there are any active alerts
 *       400:
 *         description: Bad request - invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Location not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/alerts', async (req, res) => {
  try {
    const { lat, lon, city, zipcode, country } = req.query;

    // Validate required parameters
    if (!city && !zipcode && (!lat || !lon)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Either city, zipcode, or both lat and lon parameters are required'
      });
    }

    // Check for conflicting parameters
    const locationParams = [city, zipcode, (lat && lon ? 'coordinates' : null)].filter(Boolean);
    if (locationParams.length > 1) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Provide only one location parameter: city, zipcode, or lat/lon coordinates'
      });
    }

    let alertsData;

    if (zipcode) {
      alertsData = await weatherService.getWeatherAlertsByZipcode(zipcode, country);
    } else if (city) {
      alertsData = await weatherService.getWeatherAlertsByCity(city, country);
    } else {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);

      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Latitude and longitude must be valid numbers'
        });
      }

      if (latitude < -90 || latitude > 90) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Latitude must be between -90 and 90'
        });
      }

      if (longitude < -180 || longitude > 180) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Longitude must be between -180 and 180'
        });
      }

      alertsData = await weatherService.getWeatherAlerts(latitude, longitude);
    }

    res.json({
      success: true,
      data: alertsData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Weather alerts error:', error);
    
    if (error.message.includes('Location not found')) {
      return res.status(404).json({
        error: 'Not Found',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/weather/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check if the Weather API service is running and healthy
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Weather API is running'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: '2024-01-15T12:00:00.000Z'
 *                 version:
 *                   type: string
 *                   example: '1.0.0'
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Weather API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default router;
