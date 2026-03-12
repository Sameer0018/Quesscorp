import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { ResultSetHeader } from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/connection';

const router = Router();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post(
  '/',
  [
    body('full_name').trim().notEmpty().withMessage('Full name is required'),
    body('email').trim().notEmpty().withMessage('Email is required').matches(emailRegex).withMessage('Invalid email format'),
    body('department').trim().notEmpty().withMessage('Department is required'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        error: 'Validation failed',
        details: errors.array().map((e) => (e as { msg: string }).msg),
      });
      return;
    }
    const { full_name, email, department } = req.body;
    try {
      const existing = await query<{ id: string }[]>('SELECT id FROM employees WHERE email = ?', [email]);
      if (Array.isArray(existing) && existing.length > 0) {
        res.status(409).json({ error: 'Email already exists', details: ['An employee with this email already exists'] });
        return;
      }
      const id = uuidv4();
      await query(
        'INSERT INTO employees (id, full_name, email, department) VALUES (?, ?, ?, ?)',
        [id, full_name, email, department]
      );
      const rows = await query<{ id: string; full_name: string; email: string; department: string }[]>(
        'SELECT id, full_name, email, department FROM employees WHERE id = ?',
        [id]
      );
      const employee = Array.isArray(rows) ? rows[0] : { id, full_name, email, department };
      res.status(201).json(employee);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error', details: [] });
    }
  }
);

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await query<{ id: string; full_name: string; email: string; department: string }[]>(
      'SELECT id, full_name, email, department FROM employees ORDER BY full_name'
    );
    res.status(200).json(Array.isArray(rows) ? rows : []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error', details: [] });
  }
});

router.get(
  '/:id',
  [param('id').isUUID().withMessage('Invalid employee ID')],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: 'Validation failed', details: errors.array().map((e) => (e as { msg: string }).msg) });
      return;
    }
    const { id } = req.params;
    try {
      const rows = await query<{ id: string; full_name: string; email: string; department: string }[]>(
        'SELECT id, full_name, email, department FROM employees WHERE id = ?',
        [id]
      );
      const employee = Array.isArray(rows) ? rows[0] : null;
      if (!employee) {
        res.status(404).json({ error: 'Employee not found', details: [] });
        return;
      }
      res.status(200).json(employee);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error', details: [] });
    }
  }
);

router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid employee ID'),
    body('full_name').trim().notEmpty().withMessage('Full name is required'),
    body('email').trim().notEmpty().withMessage('Email is required').matches(emailRegex).withMessage('Invalid email format'),
    body('department').trim().notEmpty().withMessage('Department is required'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        error: 'Validation failed',
        details: errors.array().map((e) => (e as { msg: string }).msg),
      });
      return;
    }
    const { id } = req.params;
    const { full_name, email, department } = req.body;
    try {
      const existingById = await query<{ id: string }[]>('SELECT id FROM employees WHERE id = ?', [id]);
      if (Array.isArray(existingById) && existingById.length === 0) {
        res.status(404).json({ error: 'Employee not found', details: [] });
        return;
      }
      const existingByEmail = await query<{ id: string }[]>('SELECT id FROM employees WHERE email = ? AND id != ?', [email, id]);
      if (Array.isArray(existingByEmail) && existingByEmail.length > 0) {
        res.status(409).json({ error: 'Email already exists', details: [] });
        return;
      }
      await query('UPDATE employees SET full_name = ?, email = ?, department = ? WHERE id = ?', [full_name, email, department, id]);
      const rows = await query<{ id: string; full_name: string; email: string; department: string }[]>(
        'SELECT id, full_name, email, department FROM employees WHERE id = ?',
        [id]
      );
      res.status(200).json(Array.isArray(rows) ? rows[0] : { id, full_name, email, department });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error', details: [] });
    }
  }
);

router.delete(
  '/:id',
  [param('id').isUUID().withMessage('Invalid employee ID')],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: 'Validation failed', details: errors.array().map((e) => (e as { msg: string }).msg) });
      return;
    }
    const { id } = req.params;
    try {
      const result = await query<ResultSetHeader>('DELETE FROM employees WHERE id = ?', [id]);
      const affected = Array.isArray(result) ? 0 : (result as ResultSetHeader).affectedRows ?? 0;
      if (affected === 0) {
        res.status(404).json({ error: 'Employee not found', details: [] });
        return;
      }
      res.status(204).send();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error', details: [] });
    }
  }
);

export default router;
