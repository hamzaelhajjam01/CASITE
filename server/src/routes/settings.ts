import { Router } from 'express';
import { z } from 'zod';
import { getDB } from '../db/client.js';
import { requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const SETTINGS_KEY = 'main';

const settingsSchema = z.object({
  company_name:    z.string().min(1).max(200),
  etransfer_email: z.string().email(),
});

// ─── GET /api/settings  (public) ──────────────────────────────────
router.get('/settings', async (_req, res, next) => {
  try {
    const db  = getDB();
    const doc = await db.collection('settings').findOne({ key: SETTINGS_KEY });
    res.json({
      company_name:    doc?.company_name    ?? 'Airwallex (Canada) International',
      etransfer_email: doc?.etransfer_email ?? 'polarguardtransfers@outlook.com',
    });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/admin/settings  (admin) ─────────────────────────────
router.put('/settings', requireAdmin, validate(settingsSchema), async (req, res, next) => {
  try {
    const db = getDB();
    await db.collection('settings').updateOne(
      { key: SETTINGS_KEY },
      { $set: { key: SETTINGS_KEY, ...req.body, updated_at: new Date() } },
      { upsert: true },
    );
    res.json(req.body);
  } catch (err) {
    next(err);
  }
});

export default router;
