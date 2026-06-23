const express = require('express');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const pool = require('../config/database');

const router = express.Router();

// Get profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, student_number } = req.body;
    const user = await User.update(req.userId, { name, student_number, onboarding_complete: true });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Save available hours
router.post('/hours', authMiddleware, async (req, res) => {
  try {
    const { weekdays, weekends } = req.body;
    await pool.query(
      `INSERT INTO user_hours (user_id, weekdays, weekends)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id)
       DO UPDATE SET weekdays = $2, weekends = $3, updated_at = CURRENT_TIMESTAMP`,
      [req.userId, JSON.stringify(weekdays), JSON.stringify(weekends)]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get available hours
router.get('/hours', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT weekdays, weekends FROM user_hours WHERE user_id = $1',
      [req.userId]
    );
    res.json({ hours: result.rows[0] || null });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Complete onboarding
router.post('/onboarding/complete', authMiddleware, async (req, res) => {
  try {
    await User.update(req.userId, { onboarding_complete: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;