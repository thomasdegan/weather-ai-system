/**
 * Basic tests for Weather API
 * Run with: node --test src/tests/weather.test.js
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/weather';

describe('Weather API Tests', () => {
  
  test('Health check endpoint', async () => {
    const response = await axios.get(`${API_BASE_URL}/health`);
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data.success, true);
    assert.strictEqual(response.data.message, 'Weather API is running');
  });

  test('Current weather by coordinates - valid request', async () => {
    const response = await axios.get(`${API_BASE_URL}/current`, {
      params: {
        lat: 40.7128,
        lon: -74.0060,
        units: 'metric'
      }
    });
    
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data.success, true);
    assert.ok(response.data.data.location);
    assert.ok(response.data.data.current);
    assert.ok(response.data.data.current.temperature);
    assert.ok(response.data.data.current.weather);
  });

  test('Current weather by city - valid request', async () => {
    const response = await axios.get(`${API_BASE_URL}/current`, {
      params: {
        city: 'London',
        country: 'GB',
        units: 'metric'
      }
    });
    
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data.success, true);
    assert.ok(response.data.data.location);
    assert.ok(response.data.data.current);
  });

  test('Forecast by coordinates - valid request', async () => {
    const response = await axios.get(`${API_BASE_URL}/forecast`, {
      params: {
        lat: 40.7128,
        lon: -74.0060,
        days: 3,
        units: 'metric'
      }
    });
    
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data.success, true);
    assert.ok(response.data.data.location);
    assert.ok(Array.isArray(response.data.data.daily));
    assert.ok(response.data.data.daily.length > 0);
  });

  test('Forecast by city - valid request', async () => {
    const response = await axios.get(`${API_BASE_URL}/forecast`, {
      params: {
        city: 'Tokyo',
        days: 2,
        units: 'metric'
      }
    });
    
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data.success, true);
    assert.ok(response.data.data.location);
    assert.ok(Array.isArray(response.data.data.daily));
  });

  test('Current weather - missing parameters', async () => {
    try {
      await axios.get(`${API_BASE_URL}/current`, {
        params: {
          units: 'metric'
        }
      });
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert.strictEqual(error.response.status, 400);
      assert.ok(error.response.data.error);
      assert.ok(error.response.data.message);
    }
  });

  test('Current weather - invalid coordinates', async () => {
    try {
      await axios.get(`${API_BASE_URL}/current`, {
        params: {
          lat: 999,
          lon: 999,
          units: 'metric'
        }
      });
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert.strictEqual(error.response.status, 400);
      assert.ok(error.response.data.error);
    }
  });

  test('Forecast - invalid days parameter', async () => {
    try {
      await axios.get(`${API_BASE_URL}/forecast`, {
        params: {
          city: 'London',
          days: 20,
          units: 'metric'
        }
      });
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert.strictEqual(error.response.status, 400);
      assert.ok(error.response.data.error);
    }
  });

  test('Current weather - invalid units', async () => {
    try {
      await axios.get(`${API_BASE_URL}/current`, {
        params: {
          city: 'London',
          units: 'invalid'
        }
      });
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert.strictEqual(error.response.status, 400);
      assert.ok(error.response.data.error);
    }
  });

  test('404 - non-existent endpoint', async () => {
    try {
      await axios.get(`${API_BASE_URL}/nonexistent`);
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert.strictEqual(error.response.status, 404);
      assert.ok(error.response.data.error);
    }
  });
});
