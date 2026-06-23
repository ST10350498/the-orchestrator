const express = require('express');
const authMiddleware = require('../middleware/auth');
const PortfolioEntry = require('../models/PortfolioEntry');
const Project = require('../models/Project');
const pool = require('../config/database');

const router = express.Router();

// Get all portfolio entries
router.get('/', authMiddleware, async (req, res) => {
  try {
    const entries = await PortfolioEntry.findByUserId(req.userId);
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Generate portfolio entry for a project
router.post('/projects/:projectId/generate', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId, req.userId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const bullet = await PortfolioEntry.generateBullet(project);
    const entry = await PortfolioEntry.create({
      user_id: req.userId,
      project_id: project.id,
      content: `Completed ${project.title} (${project.code}) - ${project.type}`,
      bullet_point: bullet,
    });

    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Export CV bullets
router.get('/export', authMiddleware, async (req, res) => {
  try {
    const entries = await PortfolioEntry.findByUserId(req.userId);
    const cvBullets = entries.map(e => e.bullet_point).filter(Boolean);

    res.json({
      cv_bullets: cvBullets,
      total: cvBullets.length,
      export_date: new Date().toISOString(),
      format: 'Copy and paste these into your CV or LinkedIn',
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete portfolio entry
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM portfolio_entries WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;