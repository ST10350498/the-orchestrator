const pool = require('../config/database');

class Task {
  static async create(data) {
    const { project_id, title, description, estimated_minutes } = data;
    const result = await pool.query(
      `INSERT INTO tasks (project_id, title, description, estimated_minutes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [project_id, title, description, estimated_minutes]
    );
    return result.rows[0];
  }

  static async findByProjectId(projectId) {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at ASC',
      [projectId]
    );
    return result.rows;
  }

  static async update(id, userId, data) {
    const { title, description, estimated_minutes, completed } = data;
    const result = await pool.query(
      `UPDATE tasks
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           estimated_minutes = COALESCE($3, estimated_minutes),
           completed = COALESCE($4, completed),
           completed_at = CASE WHEN $4 = true THEN CURRENT_TIMESTAMP ELSE NULL END
       WHERE id = $5
       RETURNING *`,
      [title, description, estimated_minutes, completed, id]
    );
    return result.rows[0];
  }

  static async delete(id, userId) {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }

  static async getPending(userId) {
    const result = await pool.query(
      `SELECT t.*, p.title as project_title, p.code
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE p.user_id = $1 AND t.completed = false
       ORDER BY p.due_date NULLS LAST, t.created_at ASC`,
      [userId]
    );
    return result.rows;
  }
}

module.exports = Task;