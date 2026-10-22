const express = require('express');
const pool = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/activities - list all (any logged-in user)
router.get('/', requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT a.*, c.name AS category_name FROM activities a
     JOIN categories c ON c.id = a.category_id
     ORDER BY a.category_id, a.name`
  );
  res.json({ activities: rows });
});

// POST /api/activities - create (content manager only)
router.post('/', requireAuth, requireRole('content_manager'), async (req, res) => {
  try {
    const {
      category_id, name, description,
      min_temp_c, max_temp_c, weather_conditions,
      max_precip_probability, setting,
    } = req.body;

    if (!category_id || !name) {
      return res.status(400).json({ message: 'category_id and name are required.' });
    }

    const [result] = await pool.query(
      `INSERT INTO activities
        (category_id, name, description, min_temp_c, max_temp_c, weather_conditions, max_precip_probability, setting)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id, name, description || null,
        min_temp_c ?? -50, max_temp_c ?? 60,
        weather_conditions || 'Any',
        max_precip_probability ?? 100,
        setting || 'both',
      ]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not create activity.' });
  }
});

// PUT /api/activities/:id - update (content manager only)
router.put('/:id', requireAuth, requireRole('content_manager'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      category_id, name, description,
      min_temp_c, max_temp_c, weather_conditions,
      max_precip_probability, setting, is_active,
    } = req.body;

    await pool.query(
      `UPDATE activities SET
        category_id = ?, name = ?, description = ?,
        min_temp_c = ?, max_temp_c = ?, weather_conditions = ?,
        max_precip_probability = ?, setting = ?, is_active = ?
       WHERE id = ?`,
      [category_id, name, description, min_temp_c, max_temp_c,
        weather_conditions, max_precip_probability, setting, is_active ?? 1, id]
    );
    res.json({ message: 'Activity updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not update activity.' });
  }
});

// DELETE /api/activities/:id - (content manager only)
router.delete('/:id', requireAuth, requireRole('content_manager'), async (req, res) => {
  await pool.query('DELETE FROM activities WHERE id = ?', [req.params.id]);
  res.json({ message: 'Activity deleted.' });
});

module.exports = router;
