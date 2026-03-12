import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/connection';
import { config } from '../config';
import { authMiddleware, JwtPayload } from '../middleware/auth';

const router = Router();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post(
  '/login',
  [
    body('email').trim().notEmpty().withMessage('Email is required').matches(emailRegex).withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required'),
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

    const { email, password } = req.body;
    try {
      const rows = await query<{ id: string; email: string; password_hash: string }[]>(
        'SELECT id, email, password_hash FROM users WHERE email = ?',
        [email]
      );
      const user = Array.isArray(rows) ? rows[0] : null;
      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        res.status(401).json({ error: 'Invalid email or password', details: [] });
        return;
      }
      const token = jwt.sign(
        { userId: user.id, email: user.email } as JwtPayload,
        config.jwtSecret,
        { expiresIn: '7d' }
      );
      res.status(200).json({ token, user: { id: user.id, email: user.email } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error', details: [] });
    }
  }
);

router.get('/me', authMiddleware, (req: Request, res: Response): void => {
  const user = (req as Request & { user: JwtPayload }).user;
  res.status(200).json({ id: user.userId, email: user.email });
});

router.post('/logout', (_req: Request, res: Response): void => {
  res.status(200).json({ message: 'Logged out. Client should discard token.' });
});

// Register (for seeding / first user) - optional, can be removed in prod
router.post(
  '/register',
  [
    body('email').trim().notEmpty().withMessage('Email is required').matches(emailRegex).withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
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
    const { email, password } = req.body;
    try {
      const existing = await query<{ id: string }[]>('SELECT id FROM users WHERE email = ?', [email]);
      if (Array.isArray(existing) && existing.length > 0) {
        res.status(409).json({ error: 'Email already registered', details: [] });
        return;
      }
      const id = uuidv4();
      const password_hash = await bcrypt.hash(password, 10);
      await query('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)', [id, email, password_hash]);
      const token = jwt.sign(
        { userId: id, email } as JwtPayload,
        config.jwtSecret,
        { expiresIn: '7d' }
      );
      res.status(201).json({ token, user: { id, email } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error', details: [] });
    }
  }
);

export default router;
