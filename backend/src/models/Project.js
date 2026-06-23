const pool = require('../config/database');

class Project {
  static async create(data) {
    const { user_id, code, title, type, due_date, hours_estimated, description } = data;
    const result = await pool.query(
      `INSERT INTO projects (user_id, code, title, type, due_date, hours_estimated, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [user_id, code, title, type, due_date, hours_estimated, description]
    );
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const result = await pool.query(
      'SELECT * FROM projects WHERE user_id = $1 ORDER BY due_date NULLS LAST, created_at DESC',
      [userId]
    );
    return result.rows;
  }

  static async findById(id, userId) {
    const result = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rows[0];
  }

  static async update(id, userId, data) {
    const { status, hours_spent, next_action, ai_risk } = data;
    const result = await pool.query(
      `UPDATE projects
       SET status = COALESCE($1, status),
           hours_spent = COALESCE($2, hours_spent),
           next_action = COALESCE($3, next_action),
           ai_risk = COALESCE($4, ai_risk)
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [status, hours_spent, next_action, ai_risk, id, userId]
    );
    return result.rows[0];
  }

  static async delete(id, userId) {
    const result = await pool.query(
      'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    return result.rows[0];
  }

  static async getStats(userId) {
    const result = await pool.query(
      `SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'submitted' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'not_started' THEN 1 END) as not_started
       FROM projects
       WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0];
  }
}

module.exports = Project;