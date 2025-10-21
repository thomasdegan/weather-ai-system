import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Weather API',
      version: '1.0.0',
      description: 'A comprehensive weather API service providing current weather and forecasts for any location worldwide. Completely free using Open-Meteo API - no API key required!',
      contact: {
        name: 'Weather API Support',
        url: 'https://github.com/your-username/weather-api',
        email: 'support@weatherapi.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://your-production-url.com',
        description: 'Production server'
      }
    ],
    components: {
      schemas: {
        Location: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Location name',
              example: 'New York'
            },
            country: {
              type: 'string',
              description: 'Country code',
              example: 'US'
            },
            coordinates: {
              type: 'object',
              properties: {
                lat: {
                  type: 'number',
                  description: 'Latitude',
                  example: 40.7128
                },
                lon: {
                  type: 'number',
                  description: 'Longitude',
                  example: -74.0060
                }
              }
            }
          }
        },
        CurrentWeather: {
          type: 'object',
          properties: {
            temperature: {
              type: 'number',
              description: 'Current temperature',
              example: 22.5
            },
            feelsLike: {
              type: 'number',
              description: 'Feels like temperature',
              example: 25.1
            },
            humidity: {
              type: 'number',
              description: 'Humidity percentage',
              example: 65
            },
            pressure: {
              type: 'number',
              description: 'Atmospheric pressure',
              example: 1013
            },
            weather: {
              type: 'object',
              properties: {
                main: {
                  type: 'string',
                  description: 'Weather condition',
                  example: 'Clear'
                },
                description: {
                  type: 'string',
                  description: 'Weather description',
                  example: 'clear sky'
                },
                icon: {
                  type: 'string',
                  description: 'Weather icon code',
                  example: '01d'
                }
              }
            },
            wind: {
              type: 'object',
              properties: {
                speed: {
                  type: 'number',
                  description: 'Wind speed',
                  example: 3.2
                },
                direction: {
                  type: 'number',
                  description: 'Wind direction in degrees',
                  example: 180
                },
                gust: {
                  type: 'number',
                  description: 'Wind gust speed',
                  example: 5.1
                }
              }
            },
            clouds: {
              type: 'number',
              description: 'Cloud cover percentage',
              example: 0
            },
            precipitation: {
              type: 'object',
              properties: {
                rain: {
                  type: 'number',
                  description: 'Rain amount',
                  example: 0
                },
                showers: {
                  type: 'number',
                  description: 'Shower amount',
                  example: 0
                },
                snowfall: {
                  type: 'number',
                  description: 'Snow amount',
                  example: 0
                }
              }
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Weather data timestamp',
              example: '2024-01-15T12:00:00.000Z'
            }
          }
        },
        DailyForecast: {
          type: 'object',
          properties: {
            date: {
              type: 'string',
              format: 'date',
              description: 'Forecast date',
              example: '2024-01-15'
            },
            temperature: {
              type: 'object',
              properties: {
                max: {
                  type: 'number',
                  description: 'Maximum temperature',
                  example: 25.8
                },
                min: {
                  type: 'number',
                  description: 'Minimum temperature',
                  example: 18.2
                },
                feelsLikeMax: {
                  type: 'number',
                  description: 'Maximum feels like temperature',
                  example: 28.1
                },
                feelsLikeMin: {
                  type: 'number',
                  description: 'Minimum feels like temperature',
                  example: 20.5
                }
              }
            },
            weather: {
              type: 'object',
              properties: {
                main: {
                  type: 'string',
                  description: 'Weather condition',
                  example: 'Clear'
                },
                description: {
                  type: 'string',
                  description: 'Weather description',
                  example: 'clear sky'
                },
                icon: {
                  type: 'string',
                  description: 'Weather icon code',
                  example: '01d'
                }
              }
            },
            precipitation: {
              type: 'object',
              properties: {
                sum: {
                  type: 'number',
                  description: 'Total precipitation',
                  example: 0
                },
                rain: {
                  type: 'number',
                  description: 'Rain amount',
                  example: 0
                },
                showers: {
                  type: 'number',
                  description: 'Shower amount',
                  example: 0
                },
                snowfall: {
                  type: 'number',
                  description: 'Snow amount',
                  example: 0
                },
                hours: {
                  type: 'number',
                  description: 'Precipitation hours',
                  example: 0
                },
                probability: {
                  type: 'number',
                  description: 'Precipitation probability percentage',
                  example: 0
                }
              }
            },
            wind: {
              type: 'object',
              properties: {
                maxSpeed: {
                  type: 'number',
                  description: 'Maximum wind speed',
                  example: 5.2
                },
                maxGust: {
                  type: 'number',
                  description: 'Maximum wind gust',
                  example: 8.1
                },
                direction: {
                  type: 'number',
                  description: 'Dominant wind direction',
                  example: 180
                }
              }
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Request success status',
              example: true
            },
            data: {
              type: 'object',
              description: 'Response data'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Response timestamp',
              example: '2024-01-15T12:00:00.000Z'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error type',
              example: 'Bad Request'
            },
            message: {
              type: 'string',
              description: 'Error message',
              example: 'Either city, zipcode, or both lat and lon parameters are required'
            }
          }
        }
      },
      parameters: {
        Latitude: {
          name: 'lat',
          in: 'query',
          description: 'Latitude coordinate',
          required: false,
          schema: {
            type: 'number',
            minimum: -90,
            maximum: 90,
            example: 40.7128
          }
        },
        Longitude: {
          name: 'lon',
          in: 'query',
          description: 'Longitude coordinate',
          required: false,
          schema: {
            type: 'number',
            minimum: -180,
            maximum: 180,
            example: -74.0060
          }
        },
        City: {
          name: 'city',
          in: 'query',
          description: 'City name',
          required: false,
          schema: {
            type: 'string',
            example: 'New York'
          }
        },
        Zipcode: {
          name: 'zipcode',
          in: 'query',
          description: 'Zipcode or postal code',
          required: false,
          schema: {
            type: 'string',
            example: '10001'
          }
        },
        Country: {
          name: 'country',
          in: 'query',
          description: 'Country code (optional, used with city/zipcode)',
          required: false,
          schema: {
            type: 'string',
            example: 'US'
          }
        },
        Units: {
          name: 'units',
          in: 'query',
          description: 'Temperature units',
          required: false,
          schema: {
            type: 'string',
            enum: ['metric', 'imperial', 'kelvin'],
            default: 'metric',
            example: 'metric'
          }
        },
        Days: {
          name: 'days',
          in: 'query',
          description: 'Number of days for forecast',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 16,
            default: 5,
            example: 5
          }
        },
        StartDate: {
          name: 'start_date',
          in: 'query',
          description: 'Start date in YYYY-MM-DD format',
          required: false,
          schema: {
            type: 'string',
            format: 'date',
            example: '2025-10-25'
          }
        },
        EndDate: {
          name: 'end_date',
          in: 'query',
          description: 'End date in YYYY-MM-DD format',
          required: false,
          schema: {
            type: 'string',
            format: 'date',
            example: '2025-10-31'
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/index.js']
};

export const specs = swaggerJsdoc(options);
