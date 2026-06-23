const pool = require('../config/database');

class PortfolioEntry {
  static async create(data) {
    const { user_id, project_id, content, bullet_point } = data;
    const result = await pool.query(
      `INSERT INTO portfolio_entries (user_id, project_id, content, bullet_point)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user_id, project_id, content, bullet_point]
    );
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const result = await pool.query(
      `SELECT pe.*, p.title as project_title
       FROM portfolio_entries pe
       JOIN projects p ON pe.project_id = p.id
       WHERE pe.user_id = $1
       ORDER BY pe.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async generateBullet(project) {
    const templates = [
      `Completed ${project.title} (${project.code}), implementing full CRUD operations and validation logic.`,
      `Developed ${project.title} with ${project.hours_estimated}+ hours of work, meeting all rubric requirements.`,
      `Designed and implemented ${project.title}, focusing on ${project.type === 'assignment' ? 'academic requirements' : 'practical application'}.`,
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }
}

module.exports = PortfolioEntry;