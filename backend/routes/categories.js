const express = require('express');
const pool = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM categories ORDER BY name');
  res.json({ categories: rows });
});

router.post('/', requireAuth, requireRole('content_manager'), async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'name is required.' });
    const [result] = await pool.query(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description || null]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'A category with that name already exists.' });
    }
    console.error(err);
    res.status(500).json({ message: 'Could not create category.' });
  }
});

router.put('/:id', requireAuth, requireRole('content_manager'), async (req, res) => {
  const { name, description } = req.body;
  await pool.query('UPDATE categories SET name = ?, description = ? WHERE id = ?', [
    name, description, req.params.id,
  ]);
  res.json({ message: 'Category updated.' });
});

router.delete('/:id', requireAuth, requireRole('content_manager'), async (req, res) => {
  await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
  res.json({ message: 'Category deleted.' });
});

module.exports = router;
