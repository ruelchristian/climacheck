import React, { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function AlertSettings() {
  const [settings, setSettings] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/alerts/settings').then((data) => setSettings(data.settings)).catch((e) => setError(e.message));
  }, []);

  function update(field, value) {
    setSettings((s) => ({ ...s, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await api.put('/alerts/settings', settings);
      setMessage('Alert settings saved.');
    } catch (err) {
      setError(err.message);
    }
  }

  if (!settings) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <h1>Weather Alert Settings</h1>
      <p className="hint">You'll be warned on the dashboard when a search crosses one of these thresholds.</p>
      <form onSubmit={handleSubmit} className="card form">
        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        <label>High temperature alert (°C)</label>
        <input type="number" value={settings.high_temp_threshold_c}
          onChange={(e) => update('high_temp_threshold_c', e.target.value)} />

        <label>Low temperature alert (°C)</label>
        <input type="number" value={settings.low_temp_threshold_c}
          onChange={(e) => update('low_temp_threshold_c', e.target.value)} />

        <label>Precipitation probability alert (%)</label>
        <input type="number" min="0" max="100" value={settings.precip_probability_threshold}
          onChange={(e) => update('precip_probability_threshold', e.target.value)} />

        <label>Wind speed alert (kph)</label>
        <input type="number" value={settings.wind_speed_threshold_kph}
          onChange={(e) => update('wind_speed_threshold_kph', e.target.value)} />

        <button type="submit">Save Settings</button>
      </form>
    </div>
  );
}
