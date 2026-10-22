const express = require('express');
const pool = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/users - list all users (content manager only)
router.get('/users', requireAuth, requireRole('content_manager'), async (req, res) => {
  const [rows] = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
  res.json({ users: rows });
});

// PUT /api/admin/users/:id/role - promote/demote a user
router.put('/users/:id/role', requireAuth, requireRole('content_manager'), async (req, res) => {
  const { role } = req.body;
  if (!['user', 'content_manager'].includes(role)) {
    return res.status(400).json({ message: 'role must be "user" or "content_manager".' });
  }
  await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
  res.json({ message: 'Role updated.' });
});

module.exports = router;
