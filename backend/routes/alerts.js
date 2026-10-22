const express = require('express');
const pool = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET current user's alert thresholds
router.get('/settings', requireAuth, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM alert_settings WHERE user_id = ?', [req.user.id]);
  if (rows.length === 0) {
    // Shouldn't normally happen (created at registration), but stay safe.
    await pool.query('INSERT INTO alert_settings (user_id) VALUES (?)', [req.user.id]);
    const [fresh] = await pool.query('SELECT * FROM alert_settings WHERE user_id = ?', [req.user.id]);
    return res.json({ settings: fresh[0] });
  }
  res.json({ settings: rows[0] });
});

// UPDATE current user's alert thresholds
router.put('/settings', requireAuth, async (req, res) => {
  const {
    high_temp_threshold_c, low_temp_threshold_c,
    precip_probability_threshold, wind_speed_threshold_kph,
  } = req.body;

  await pool.query(
    `UPDATE alert_settings SET
      high_temp_threshold_c = ?, low_temp_threshold_c = ?,
      precip_probability_threshold = ?, wind_speed_threshold_kph = ?
     WHERE user_id = ?`,
    [high_temp_threshold_c, low_temp_threshold_c, precip_probability_threshold, wind_speed_threshold_kph, req.user.id]
  );
  res.json({ message: 'Alert settings updated.' });
});

// POST /api/alerts/check - given a weather reading, returns which
// thresholds (if any) the current user's settings are breaching.
router.post('/check', requireAuth, async (req, res) => {
  const { temperature_c, precipitation_probability, wind_speed_kph } = req.body;
  const [rows] = await pool.query('SELECT * FROM alert_settings WHERE user_id = ?', [req.user.id]);
  const settings = rows[0];
  if (!settings) return res.json({ alerts: [] });

  const alerts = [];
  if (temperature_c >= settings.high_temp_threshold_c) {
    alerts.push({ type: 'high_temp', message: `Temperature is ${temperature_c}°C, at or above your ${settings.high_temp_threshold_c}°C threshold.` });
  }
  if (temperature_c <= settings.low_temp_threshold_c) {
    alerts.push({ type: 'low_temp', message: `Temperature is ${temperature_c}°C, at or below your ${settings.low_temp_threshold_c}°C threshold.` });
  }
  if (precipitation_probability >= settings.precip_probability_threshold) {
    alerts.push({ type: 'precipitation', message: `Precipitation probability is ${precipitation_probability}%, at or above your ${settings.precip_probability_threshold}% threshold.` });
  }
  if (wind_speed_kph >= settings.wind_speed_threshold_kph) {
    alerts.push({ type: 'wind', message: `Wind speed is ${wind_speed_kph} kph, at or above your ${settings.wind_speed_threshold_kph} kph threshold.` });
  }

  res.json({ alerts });
});

// ---- Admin: manage default/global thresholds isn't in scope per proposal;
// content managers configure their own alert settings the same way users do.

module.exports = router;
