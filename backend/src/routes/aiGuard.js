const express = require('express');
const authMiddleware = require('../middleware/auth');
const AICheck = require('../models/AICheck');
const { detectAIScore, humanizeText } = require('../utils/aiPatterns');
const { aiCheckSchema } = require('../utils/validators');

const router = express.Router();

// Check text for AI
router.post('/check', authMiddleware, async (req, res) => {
  try {
    const { error } = aiCheckSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { text } = req.body;
    const { score, verdict, suggestions } = detectAIScore(text);

    let humanized = null;
    if (verdict === 'rewrite' && score > 60) {
      humanized = humanizeText(text);
    }

    await AICheck.create({
      user_id: req.userId,
      original_text: text.substring(0, 1000),
      score,
      verdict,
      humanized_text: humanized ? humanized.substring(0, 1000) : null,
      suggestions,
    });

    res.json({
      original: text,
      score,
      verdict,
      suggestions,
      humanized,
      target: 20,
      alert: 40,
      message: score <= 20 ? '✅ Safe to submit' : score <= 40 ? '⚠️ Review recommended' : '❌ Rewrite required',
    });
  } catch (error) {
    console.error('AI Guard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const checks = await AICheck.findByUserId(req.userId);
    const stats = await AICheck.getStats(req.userId);
    const weekly = await AICheck.getWeeklyStats(req.userId);
    res.json({ checks, stats, weekly });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const stats = await AICheck.getStats(req.userId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;