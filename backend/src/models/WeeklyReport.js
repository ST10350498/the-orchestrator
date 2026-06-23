const pool = require('../config/database');

class WeeklyReport {
  static async generate(userId) {
    const completed = await pool.query(
      `SELECT * FROM projects
       WHERE user_id = $1
         AND status = 'submitted'
         AND updated_at > NOW() - INTERVAL '7 days'`,
      [userId]
    );

    const aiStats = await pool.query(
      `SELECT
        COUNT(*) as total,
        AVG(score) as avg_score
       FROM ai_checks
       WHERE user_id = $1 AND created_at > NOW() - INTERVAL '7 days'`,
      [userId]
    );

    const pending = await pool.query(
      `SELECT * FROM projects
       WHERE user_id = $1 AND status != 'submitted'
       ORDER BY due_date NULLS LAST`,
      [userId]
    );

    const streak = await pool.query(
      `SELECT COUNT(DISTINCT DATE(created_at)) as days_active
       FROM ai_checks
       WHERE user_id = $1 AND created_at > NOW() - INTERVAL '7 days'`,
      [userId]
    );

    const report = {
      week_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      week_end: new Date().toISOString().slice(0, 10),
      completed: completed.rows.map(p => ({ id: p.id, title: p.title })),
      pending: pending.rows.map(p => ({ id: p.id, title: p.title, due_date: p.due_date })),
      ai_stats: {
        total_checks: parseInt(aiStats.rows[0].total) || 0,
        avg_score: Math.round(aiStats.rows[0].avg_score) || 0,
      },
      streak: parseInt(streak.rows[0].days_active) || 0,
      generated_at: new Date().toISOString(),
    };

    await pool.query(
      `INSERT INTO weekly_reports (user_id, week_start, week_end, report_data)
       VALUES ($1, $2, $3, $4)`,
      [userId, report.week_start, report.week_end, JSON.stringify(report)]
    );

    return report;
  }

  static async findByUserId(userId) {
    const result = await pool.query(
      'SELECT * FROM weekly_reports WHERE user_id = $1 ORDER BY week_start DESC LIMIT 5',
      [userId]
    );
    return result.rows;
  }
}

module.exports = WeeklyReport;