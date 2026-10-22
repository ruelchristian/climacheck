const express = require('express');
const axios = require('axios');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();
const OWM_KEY = process.env.OPENWEATHER_API_KEY;
const OWM_BASE = 'https://api.openweathermap.org';

// Picks a random subset of a given size from an array without repeats.
function pickRandom(arr, count) {
  const copy = [...arr];
  const picked = [];
  while (copy.length && picked.length < count) {
    const idx = Math.floor(Math.random() * copy.length);
    picked.push(copy.splice(idx, 1)[0]);
  }
  return picked;
}

// Finds every activity whose rule matches the current weather, then
// randomly selects `limit` of them. Calling this again for the exact
// same weather can return a different set, on purpose.
async function getRandomRecommendations({ tempC, conditionMain, precipProbability }, limit = 6) {
  const [rows] = await pool.query(
    `SELECT a.*, c.name AS category_name
     FROM activities a
     JOIN categories c ON c.id = a.category_id
     WHERE a.is_active = 1
       AND a.min_temp_c <= ?
       AND a.max_temp_c >= ?
       AND a.max_precip_probability >= ?
       AND (
         a.weather_conditions = 'Any'
         OR FIND_IN_SET(?, a.weather_conditions) > 0
         OR FIND_IN_SET('Any', a.weather_conditions) > 0
       )`,
    [tempC, tempC, precipProbability, conditionMain]
  );

  return pickRandom(rows, Math.min(limit, rows.length));
}

// GET /api/weather/current?city=Manila
router.get('/current', async (req, res) => {
  try {
    if (!OWM_KEY) {
      return res.status(500).json({ message: 'OpenWeather API key is not configured on the server.' });
    }
    const { city } = req.query;
    if (!city) {
      return res.status(400).json({ message: 'A city name is required.' });
    }

    // Geocode first so towns that share a name across regions can be disambiguated later if needed.
    const geoRes = await axios.get(`${OWM_BASE}/geo/1.0/direct`, {
      params: { q: city, limit: 5, appid: OWM_KEY },
    });

    if (!geoRes.data || geoRes.data.length === 0) {
      return res.status(404).json({ message: `No city found matching "${city}".` });
    }

    const place = geoRes.data[0];

    const [currentRes, forecastRes] = await Promise.all([
      axios.get(`${OWM_BASE}/data/2.5/weather`, {
        params: { lat: place.lat, lon: place.lon, appid: OWM_KEY, units: 'metric' },
      }),
      axios.get(`${OWM_BASE}/data/2.5/forecast`, {
        params: { lat: place.lat, lon: place.lon, appid: OWM_KEY, units: 'metric' },
      }),
    ]);

    const current = currentRes.data;
    // Precipitation probability isn't in the "current weather" endpoint;
    // use the nearest slot from the 3-hour forecast (the "pop" field, 0-1).
    const nearestForecast = forecastRes.data.list[0];
    const precipProbability = Math.round((nearestForecast?.pop || 0) * 100);

    const weatherSummary = {
      city: place.name,
      country: place.country,
      state: place.state || null,
      lat: place.lat,
      lon: place.lon,
      temperature_c: current.main.temp,
      feels_like_c: current.main.feels_like,
      condition_main: current.weather[0].main, // Clear, Clouds, Rain, etc.
      condition_description: current.weather[0].description,
      humidity: current.main.humidity,
      wind_speed_kph: Math.round(current.wind.speed * 3.6 * 10) / 10,
      precipitation_probability: precipProbability,
    };

    const recommendations = await getRandomRecommendations({
      tempC: weatherSummary.temperature_c,
      conditionMain: weatherSummary.condition_main,
      precipProbability: weatherSummary.precipitation_probability,
    });

    res.json({ weather: weatherSummary, recommendations });
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ message: 'City not found.' });
    }
    console.error(err.message);
    res.status(500).json({ message: 'Could not fetch weather data.' });
  }
});

// GET /api/weather/refresh-activities?temp=25&condition=Clear&precip=10
// Lets the frontend re-roll a fresh random set of activities for the
// weather already on screen, without calling the OpenWeather API again.
router.get('/refresh-activities', requireAuth, async (req, res) => {
  try {
    const tempC = parseFloat(req.query.temp);
    const conditionMain = req.query.condition;
    const precipProbability = parseInt(req.query.precip, 10) || 0;

    if (Number.isNaN(tempC) || !conditionMain) {
      return res.status(400).json({ message: 'temp and condition query params are required.' });
    }

    const recommendations = await getRandomRecommendations({ tempC, conditionMain, precipProbability });
    res.json({ recommendations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not refresh activities.' });
  }
});

module.exports = router;
