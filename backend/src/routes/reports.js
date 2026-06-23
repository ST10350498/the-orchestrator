const express = require('express');
const authMiddleware = require('../middleware/auth');
const WeeklyReport = require('../models/WeeklyReport');
const AICheck = require('../models/AICheck');
const Project = require('../models/Project');

const router = express.Router();

// Generate weekly report
router.post('/weekly/generate', authMiddleware, async (req, res) => {
  try {
    const report = await WeeklyReport.generate(req.userId);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get weekly reports
router.get('/weekly', authMiddleware, async (req, res) => {
  try {
    const reports = await WeeklyReport.findByUserId(req.userId);
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get latest weekly report
router.get('/weekly/latest', authMiddleware, async (req, res) => {
  try {
    const reports = await WeeklyReport.findByUserId(req.userId);
    res.json(reports[0] || null);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get coaching insights
router.get('/coach', authMiddleware, async (req, res) => {
  try {
    const projects = await Project.findByUserId(req.userId);
    const aiStats = await AICheck.getStats(req.userId);

    const insights = {
      projects_total: projects.length,
      projects_completed: projects.filter(p => p.status === 'submitted').length,
      ai_avg_score: Math.round(aiStats.avg_score || 0),
      ai_checks_total: parseInt(aiStats.total) || 0,
      recommendations: [],
    };

    if (insights.ai_avg_score > 35) {
      insights.recommendations.push('Your AI scores are high. Focus on using contractions and shorter sentences.');
    }
    if (insights.projects_completed === 0 && insights.projects_total > 0) {
      insights.recommendations.push('You have projects but none completed. Focus on finishing one project at a time.');
    }
    if (insights.ai_checks_total < 3) {
      insights.recommendations.push('You haven\'t used the AI Guard much. Test your writing before submitting assignments.');
    }

    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;