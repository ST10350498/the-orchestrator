const express = require('express');
const authMiddleware = require('../middleware/auth');
const Task = require('../models/Task');
const Project = require('../models/Project');
const pool = require('../config/database');

const router = express.Router();

router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { date, available_hours } = req.body;
    const hours = available_hours || 11;

    const tasks = await Task.getPending(req.userId);

    const hoursResult = await pool.query(
      'SELECT weekdays, weekends FROM user_hours WHERE user_id = $1',
      [req.userId]
    );
    const userHours = hoursResult.rows[0];

    const schedule = [];
    let currentTime = new Date();
    currentTime.setHours(9, 0, 0, 0);

    for (const task of tasks.slice(0, 6)) {
      const duration = Math.ceil((task.estimated_minutes || 60) / 60);
      schedule.push({
        time: currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        task: task.title,
        estimated: `${duration}h`,
        project: task.project_title || 'Unknown',
        project_id: task.project_id,
        task_id: task.id,
      });
      currentTime.setHours(currentTime.getHours() + duration);
      if (currentTime.getHours() >= 15) {
        currentTime.setHours(20, 0, 0, 0);
      }
      if (currentTime.getHours() >= 23) {
        break;
      }
    }

    const projects = await Project.findByUserId(req.userId);
    const predictions = projects
      .filter(p => p.status !== 'submitted')
      .map(project => {
        const daysLeft = project.due_date
          ? Math.ceil((new Date(project.due_date) - new Date()) / (1000 * 60 * 60 * 24))
          : null;
        const hoursRemaining = (project.hours_estimated || 0) - (project.hours_spent || 0);
        const dailyRate = 4;
        const estimatedDays = Math.ceil(Math.max(0, hoursRemaining) / dailyRate);

        return {
          project: project.title,
          due_days: daysLeft,
          hours_remaining: Math.max(0, hoursRemaining),
          predicted_completion: daysLeft !== null && estimatedDays <= daysLeft ? 'on_time' : 'late',
          risk: estimatedDays > (daysLeft || 99) ? 'high' : 'low',
        };
      });

    let coachNote = '';
    const lateCount = predictions.filter(p => p.predicted_completion === 'late').length;
    if (lateCount === 0 && predictions.length > 0) {
      coachNote = 'You are on track with all your projects. Keep up the good pace!';
    } else if (lateCount > 0) {
      coachNote = `You have ${lateCount} project(s) that may be late. Consider adjusting your schedule or requesting extensions.`;
    } else if (predictions.length === 0) {
      coachNote = 'Add some projects to start tracking your progress.';
    }

    res.json({
      schedule,
      predictions,
      coach_note: coachNote,
      user_hours: userHours,
    });
  } catch (error) {
    console.error('Schedule error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;