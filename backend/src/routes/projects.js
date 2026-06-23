const express = require('express');
const authMiddleware = require('../middleware/auth');
const Project = require('../models/Project');
const Task = require('../models/Task');
const PortfolioEntry = require('../models/PortfolioEntry');
const { projectSchema, projectUpdateSchema } = require('../utils/validators');

const router = express.Router();

// Get all projects
router.get('/', authMiddleware, async (req, res) => {
  try {
    const projects = await Project.findByUserId(req.userId);
    const stats = await Project.getStats(req.userId);
    res.json({ projects, stats });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create project
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { error } = projectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const project = await Project.create({
      ...req.body,
      user_id: req.userId,
    });

    const bullet = await PortfolioEntry.generateBullet(project);
    await PortfolioEntry.create({
      user_id: req.userId,
      project_id: project.id,
      content: `Completed ${project.title} (${project.code})`,
      bullet_point: bullet,
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get project by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id, req.userId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const tasks = await Task.findByProjectId(req.params.id);
    res.json({ project, tasks });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update project
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { error } = projectUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const project = await Project.update(req.params.id, req.userId, req.body);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete project
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await Project.delete(req.params.id, req.userId);
    if (!result) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get tasks for project
router.get('/:id/tasks', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id, req.userId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const tasks = await Task.findByProjectId(req.params.id);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create task
router.post('/:id/tasks', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id, req.userId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const task = await Task.create({
      ...req.body,
      project_id: req.params.id,
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update task
router.put('/tasks/:taskId', authMiddleware, async (req, res) => {
  try {
    const task = await Task.update(req.params.taskId, req.userId, req.body);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete task
router.delete('/tasks/:taskId', authMiddleware, async (req, res) => {
  try {
    const result = await Task.delete(req.params.taskId, req.userId);
    if (!result) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;