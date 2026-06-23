const Joi = require('joi');

const userSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  student_number: Joi.string().min(5).max(20).required(),
  password: Joi.string().min(8).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const projectSchema = Joi.object({
  code: Joi.string().min(3).max(20).required(),
  title: Joi.string().min(3).max(200).required(),
  type: Joi.string().valid('assignment', 'exam', 'project', 'personal').required(),
  due_date: Joi.date().allow(null),
  hours_estimated: Joi.number().integer().min(0).max(200),
  description: Joi.string().max(500),
});

const projectUpdateSchema = Joi.object({
  status: Joi.string().valid('not_started', 'in_progress', 'submitted'),
  hours_spent: Joi.number().integer().min(0),
  next_action: Joi.string().max(200).allow(null),
  ai_risk: Joi.string().valid('low', 'medium', 'high'),
});

const aiCheckSchema = Joi.object({
  text: Joi.string().min(1).max(10000).required(),
});

const scheduleSchema = Joi.object({
  date: Joi.date().required(),
  available_hours: Joi.number().integer().min(0).max(24),
});

module.exports = {
  userSchema,
  loginSchema,
  projectSchema,
  projectUpdateSchema,
  aiCheckSchema,
  scheduleSchema,
};