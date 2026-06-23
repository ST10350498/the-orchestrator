const pool = require('../config/database');

class AICheck {
  static async create(data) {
    const { user_id, original_text, score, verdict, humanized_text, suggestions } = data;
    const result = await pool.query(
      `INSERT INTO ai_checks (user_id, original_text, score, verdict, humanized_text, suggestions)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [user_id, original_text, score, verdict, humanized_text, JSON.stringify(suggestions)]
    );
    return result.rows[0];
  }

  static async findByUserId(userId, limit = 20) {
    const result = await pool.query(
      'SELECT * FROM ai_checks WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit]
    );
    return result.rows;
  }

  static async getStats(userId) {
    const result = await pool.query(
      `SELECT
        COUNT(*) as total,
        AVG(score) as avg_score,
        COUNT(CASE WHEN verdict = 'safe' THEN 1 END) as safe_count,
        COUNT(CASE WHEN verdict = 'review' THEN 1 END) as review_count,
        COUNT(CASE WHEN verdict = 'rewrite' THEN 1 END) as rewrite_count
       FROM ai_checks
       WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0];
  }

  static async getWeeklyStats(userId) {
    const result = await pool.query(
      `SELECT
        DATE(created_at) as date,
        AVG(score) as avg_score,
        COUNT(*) as count
       FROM ai_checks
       WHERE user_id = $1 AND created_at > NOW() - INTERVAL '7 days'
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
      [userId]
    );
    return result.rows;
  }
}

module.exports = AICheck;