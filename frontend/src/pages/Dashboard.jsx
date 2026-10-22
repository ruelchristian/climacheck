import React, { useState } from 'react';
import { api } from '../api/client';
import WeatherIcon from '../components/WeatherIcon.jsx';
import CategoryIcon from '../components/CategoryIcon.jsx';
import { getWeatherTheme } from '../theme/weatherTheme.js';
import { getCategoryColor } from '../theme/categoryTheme.js';

export default function Dashboard() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [activities, setActivities] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleSearch(e) {
    e.preventDefault();
    if (!city.trim()) return;
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const data = await api.get(`/weather/current?city=${encodeURIComponent(city)}`);
      setWeather(data.weather);
      setActivities(data.recommendations);

      const alertData = await api.post('/alerts/check', {
        temperature_c: data.weather.temperature_c,
        precipitation_probability: data.weather.precipitation_probability,
        wind_speed_kph: data.weather.wind_speed_kph,
      });
      setAlerts(alertData.alerts);
    } catch (err) {
      setError(err.message);
      setWeather(null);
      setActivities([]);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleShuffle() {
    if (!weather) return;
    setLoading(true);
    try {
      const data = await api.get(
        `/weather/refresh-activities?temp=${weather.temperature_c}&condition=${weather.condition_main}&precip=${weather.precipitation_probability}`
      );
      setActivities(data.recommendations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveLocation() {
    if (!weather) return;
    try {
      await api.post('/favorites/locations', {
        city_name: weather.city,
        country: weather.country,
        lat: weather.lat,
        lon: weather.lon,
      });
      setMessage(`Saved ${weather.city} to your locations.`);
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleFavoriteActivity(activityId) {
    try {
      await api.post('/favorites/activities', { activity_id: activityId });
      setMessage('Added to favorite activities.');
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <div className="page">
      <h1>Check the weather, get something to do</h1>

      <form onSubmit={handleSearch} className="search-bar">
        <input
          placeholder="Search a city (e.g. Cebu City)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button type="submit" disabled={loading}>{loading ? 'Loading...' : 'Search'}</button>
      </form>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      {alerts.length > 0 && (
        <div className="card alert-box">
          <h3>Weather alerts for this reading</h3>
          <ul>
            {alerts.map((a, i) => <li key={i}>{a.message}</li>)}
          </ul>
        </div>
      )}

      {weather && (() => {
        const theme = getWeatherTheme(weather.condition_main);
        return (
          <div
            className="weather-panel"
            style={{ background: theme.gradient, color: theme.ink }}
          >
            <div className="weather-panel-top">
              <div>
                <p className="weather-eyebrow">Current reading</p>
                <h2>{weather.city}{weather.state ? `, ${weather.state}` : ''}, {weather.country}</h2>
              </div>
              <button onClick={handleSaveLocation} className="btn-ghost">Save location</button>
            </div>

            <div className="weather-readout">
              <WeatherIcon name={theme.icon} className="weather-icon" />
              <div>
                <p className="temp">{Math.round(weather.temperature_c)}°</p>
                <p className="condition">{weather.condition_description} · feels like {Math.round(weather.feels_like_c)}°</p>
              </div>
            </div>

            <div className="weather-stats">
              <div className="stat"><span className="stat-label">Humidity</span><span className="stat-value">{weather.humidity}%</span></div>
              <div className="stat"><span className="stat-label">Wind</span><span className="stat-value">{weather.wind_speed_kph} kph</span></div>
              <div className="stat"><span className="stat-label">Rain chance</span><span className="stat-value">{weather.precipitation_probability}%</span></div>
            </div>
          </div>
        );
      })()}

      {activities.length > 0 && (
        <div className="activities-section">
          <div className="activities-header">
            <div>
              <h2>Suggested for right now</h2>
              <p className="hint">Randomly picked from every activity that fits this weather.</p>
            </div>
            <button onClick={handleShuffle} className="btn-secondary" disabled={loading}>Shuffle again</button>
          </div>
          <div className="activity-grid">
            {activities.map((act) => (
              <div key={act.id} className="ticket-card" style={{ '--spine': getCategoryColor(act.category_name) }}>
                <div className="ticket-spine">
                  <CategoryIcon name={act.category_name} className="ticket-icon" />
                </div>
                <div className="ticket-body">
                  <p className="category-tag">{act.category_name}</p>
                  <h3>{act.name}</h3>
                  <p className="ticket-desc">{act.description}</p>
                  <button onClick={() => handleFavoriteActivity(act.id)} className="btn-link">Save to favorites</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
