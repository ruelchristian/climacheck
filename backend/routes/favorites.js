const express = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// ---- Saved Locations ----

router.get('/locations', requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM saved_locations WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id]
  );
  res.json({ locations: rows });
});

router.post('/locations', requireAuth, async (req, res) => {
  try {
    const { city_name, country, lat, lon } = req.body;
    if (!city_name) return res.status(400).json({ message: 'city_name is required.' });

    const [result] = await pool.query(
      'INSERT INTO saved_locations (user_id, city_name, country, lat, lon) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, city_name, country || null, lat || null, lon || null]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'You already saved this city.' });
    }
    console.error(err);
    res.status(500).json({ message: 'Could not save location.' });
  }
});

router.delete('/locations/:id', requireAuth, async (req, res) => {
  await pool.query('DELETE FROM saved_locations WHERE id = ? AND user_id = ?', [
    req.params.id, req.user.id,
  ]);
  res.json({ message: 'Location removed.' });
});

// ---- Favorite Activities ----

router.get('/activities', requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT fa.id AS favorite_id, a.*
     FROM favorite_activities fa
     JOIN activities a ON a.id = fa.activity_id
     WHERE fa.user_id = ?
     ORDER BY fa.created_at DESC`,
    [req.user.id]
  );
  res.json({ favorites: rows });
});

router.post('/activities', requireAuth, async (req, res) => {
  try {
    const { activity_id } = req.body;
    if (!activity_id) return res.status(400).json({ message: 'activity_id is required.' });

    const [result] = await pool.query(
      'INSERT INTO favorite_activities (user_id, activity_id) VALUES (?, ?)',
      [req.user.id, activity_id]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Already in your favorites.' });
    }
    console.error(err);
    res.status(500).json({ message: 'Could not add favorite.' });
  }
});

router.delete('/activities/:activityId', requireAuth, async (req, res) => {
  await pool.query('DELETE FROM favorite_activities WHERE activity_id = ? AND user_id = ?', [
    req.params.activityId, req.user.id,
  ]);
  res.json({ message: 'Removed from favorites.' });
});

module.exports = router;
