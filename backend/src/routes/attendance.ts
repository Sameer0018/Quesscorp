import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/connection';

const router = Router();
const validStatuses = ['Present', 'Absent'];

router.post(
  '/',
  [
    body('employee_id').isUUID().withMessage('Valid employee ID is required'),
    body('date').isISO8601().withMessage('Valid date (YYYY-MM-DD) is required'),
    body('status').isIn(validStatuses).withMessage("Status must be 'Present' or 'Absent'"),
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
    const { employee_id, date, status } = req.body;
    const dateOnly = String(date).slice(0, 10);
    try {
      const emp = await query<{ id: string }[]>('SELECT id FROM employees WHERE id = ?', [employee_id]);
      if (Array.isArray(emp) && emp.length === 0) {
        res.status(404).json({ error: 'Employee not found', details: [] });
        return;
      }
      const existing = await query<{ id: string }[]>(
        'SELECT id FROM attendance WHERE employee_id = ? AND date = ?',
        [employee_id, dateOnly]
      );
      if (Array.isArray(existing) && existing.length > 0) {
        await query('UPDATE attendance SET status = ?, updated_at = NOW() WHERE employee_id = ? AND date = ?', [
          status,
          employee_id,
          dateOnly,
        ]);
        const rows = await query<{ id: string; employee_id: string; date: string; status: string }[]>(
          'SELECT id, employee_id, date, status FROM attendance WHERE employee_id = ? AND date = ?',
          [employee_id, dateOnly]
        );
        res.status(200).json(Array.isArray(rows) ? rows[0] : { id: existing[0].id, employee_id, date: dateOnly, status });
        return;
      }
      const id = uuidv4();
      await query('INSERT INTO attendance (id, employee_id, date, status) VALUES (?, ?, ?, ?)', [id, employee_id, dateOnly, status]);
      res.status(201).json({ id, employee_id, date: dateOnly, status });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error', details: [] });
    }
  }
);

router.get(
  '/:employee_id',
  [param('employee_id').isUUID().withMessage('Invalid employee ID')],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: 'Validation failed', details: errors.array().map((e) => (e as { msg: string }).msg) });
      return;
    }
    const { employee_id } = req.params;
    try {
      const emp = await query<{ id: string }[]>('SELECT id FROM employees WHERE id = ?', [employee_id]);
      if (Array.isArray(emp) && emp.length === 0) {
        res.status(404).json({ error: 'Employee not found', details: [] });
        return;
      }
      const rows = await query<{ id: string; employee_id: string; date: string; status: string }[]>(
        'SELECT id, employee_id, date, status FROM attendance WHERE employee_id = ? ORDER BY date DESC',
        [employee_id]
      );
      res.status(200).json(Array.isArray(rows) ? rows : []);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error', details: [] });
    }
  }
);

export default router;
