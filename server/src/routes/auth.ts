import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * POST /api/auth/login
 * Returns a JWT for admin routes.
 */
router.post('/login', validate(loginSchema), async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminEmail || !adminHash) {
    res.status(500).json({ error: 'Admin credentials not configured' });
    return;
  }

  // Constant-time comparison — don't short-circuit on email to prevent timing attacks
  const emailMatch = email === adminEmail;
  const passwordMatch = await bcrypt.compare(password, adminHash);

  if (!emailMatch || !passwordMatch) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = jwt.sign(
    { sub: email },
    process.env.JWT_SECRET!,
    { expiresIn: (process.env.JWT_EXPIRES_IN || '8h') as jwt.SignOptions['expiresIn'] }
  );

  res.json({
    token,
    expires_in: process.env.JWT_EXPIRES_IN || '8h',
    email,
  });
});

export default router;
