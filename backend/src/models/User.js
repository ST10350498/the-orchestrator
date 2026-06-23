const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create({ name, email, student_number, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, student_number, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, student_number, onboarding_complete, created_at`,
      [name, email, student_number, hashedPassword]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT id, name, email, student_number, onboarding_complete, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async update(id, data) {
    const { name, student_number, onboarding_complete } = data;
    const result = await pool.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           student_number = COALESCE($2, student_number),
           onboarding_complete = COALESCE($3, onboarding_complete)
       WHERE id = $4
       RETURNING id, name, email, student_number, onboarding_complete`,
      [name, student_number, onboarding_complete, id]
    );
    return result.rows[0];
  }

  static async verifyPassword(user, password) {
    return bcrypt.compare(password, user.password_hash);
  }
}

module.exports = User;