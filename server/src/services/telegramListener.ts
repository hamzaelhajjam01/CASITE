import fs from 'fs';
import path from 'path';
import { getDB } from '../db/client.js';
import type { PolicyDoc } from '../types/index.js';
import { sendApprovalEmail } from './emailService.js';
import { generatePinkCardPDF } from './pdfService.js';

let isListening = false;

function getPinkCardPath(): string | undefined {
  const candidates = [
    path.resolve(process.cwd(), 'assets', 'PolarGuard_Official_Pink_Card.pdf'),
    path.resolve(process.cwd(), 'server', 'assets', 'PolarGuard_Official_Pink_Card.pdf'),
    path.resolve(process.cwd(), '..', 'PolarGuard_Pink_Card_Adarsh_Soni.pdf'),
    path.resolve(process.cwd(), '..', 'PolarGuard_Pink_Card_Roberto_Mendieta_2Page.pdf'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return undefined;
}

async function handleCallbackQuery(callback: any, botToken: string): Promise<void> {
  const data = callback.data as string;
  if (!data || (!data.startsWith('approve:') && !data.startsWith('reject:'))) return;

  const [action, policyNumber] = data.split(':');
  const isApprove = action === 'approve';
  const newStatus = isApprove ? 'active' : 'rejected';

  console.log(`[telegramListener] 🔘 Broker clicked [${action.toUpperCase()}] for policy ${policyNumber}`);

  let policy: PolicyDoc | null = null;
  try {
    const db = getDB();
    policy = await db.collection<PolicyDoc>('policies').findOne({
      $or: [{ policy_number: policyNumber }, { ref_num: policyNumber }],
    });

    if (policy) {
      await db.collection<PolicyDoc>('policies').updateOne(
        { policy_number: policy.policy_number },
        { $set: { status: newStatus, updated_at: new Date() } }
      );
      console.log(`[telegramListener] 💾 Updated policy ${policy.policy_number} in MongoDB to "${newStatus}"`);
    } else {
      console.warn(`[telegramListener] ⚠️ Policy ${policyNumber} not found in DB`);
    }
  } catch (dbErr) {
    console.error('[telegramListener] Database update error:', (dbErr as Error).message);
  }

  const message = callback.message;
  const isMedia = Boolean(message && (message.photo || message.document || message.caption));
  const rawContent = (message && (message.caption || message.text)) || `Policy #${policyNumber}`;

  // Extract email and customer name fallback from message content if DB didn't have it
  const emailMatch = rawContent.match(/Email:?\s*(?:<\/b>)?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
  const customerEmail = policy?.customer_email || (emailMatch ? emailMatch[1] : undefined);

  const nameMatch = rawContent.match(/Customer:?\s*(?:<\/b>)?\s*([^<\n\r]+)/i);
  const customerName = policy?.customer_name || (nameMatch ? nameMatch[1].trim() : 'Valued Customer');

  // 1. Answer callback query with alert popup in Telegram
  try {
    const alertRes = await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callback.id,
        text: isApprove
          ? `✅ Approved! Pink Slip dispatched to ${customerEmail || 'customer'}.`
          : `❌ Policy ${policyNumber} Rejected.`,
        show_alert: true,
      }),
    });
    const alertData = await alertRes.json() as { ok: boolean };
    console.log(`[telegramListener] 🔔 Telegram popup answered (Result: ${alertData.ok})`);
  } catch (err) {
    console.error('[telegramListener] Failed to answer callback query:', (err as Error).message);
  }

  // 2. Edit Telegram message to update status and remove action buttons
  try {
    if (message && message.chat && message.message_id) {
      const statusBanner = isApprove
        ? `\n\n✅ <b>STATUS: APPROVED &amp; ACTIVATED</b>\n<i>Official Pink Card dispatched to customer inbox!</i>`
        : `\n\n❌ <b>STATUS: REJECTED</b>`;

      const newContent = rawContent.replace(/\n\s*<b>Status:<\/b>.*$/m, '').replace(/\n\*Status:\*.*$/m, '') + statusBanner;

      const endpoint = isMedia ? 'editMessageCaption' : 'editMessageText';
      const bodyPayload = isMedia
        ? {
            chat_id: message.chat.id,
            message_id: message.message_id,
            caption: newContent,
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: [] },
          }
        : {
            chat_id: message.chat.id,
            message_id: message.message_id,
            text: newContent,
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: [] },
          };

      const editRes = await fetch(`https://api.telegram.org/bot${botToken}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });
      const editData = await editRes.json() as { ok: boolean; description?: string };
      console.log(`[telegramListener] 📝 Telegram message edited via ${endpoint} (Result: ${editData.ok})`);
    }
  } catch (err) {
    console.error('[telegramListener] Failed to edit Telegram message:', (err as Error).message);
  }

  // 3. Dispatch official Pink Card PDF & Approval Email to Customer
  if (isApprove && customerEmail) {
    let pinkCardPath: string | null = null;
    try {
      pinkCardPath = await generatePinkCardPDF({
        policyNumber: policy?.policy_number || policyNumber,
        customerName: customerName,
        additionalDrivers: policy?.additional_drivers,
        street: (policy as any)?.street,
        city: (policy as any)?.city,
        postal: policy?.postal,
        vehicle: policy?.vehicle || '2021 HONDA CR-V',
        vin: policy?.vin || '',
        effectiveDate: policy?.created_at || new Date(),
        term: policy?.term || '12m',
      });
    } catch (pdfErr) {
      console.error('[telegramListener] Error generating dynamic pink card PDF:', (pdfErr as Error).message);
    }

    if (!pinkCardPath) {
      pinkCardPath = getPinkCardPath() || null;
    }

    console.log(`[telegramListener] 📧 Dispatching approval email to ${customerEmail} (Pink Card: ${pinkCardPath ? path.basename(pinkCardPath) : 'none'})...`);
    sendApprovalEmail(
      customerEmail,
      customerName,
      policy?.policy_number || policyNumber,
      pinkCardPath || undefined
    )
      .then(ok => {
        if (ok) console.log(`[telegramListener] ✅ Approval email & 2-Page Pink Slip successfully delivered to ${customerEmail}!`);
      })
      .catch(err => {
        console.error('[telegramListener] ❌ Failed to dispatch approval email:', (err as Error).message);
      });
  } else if (isApprove && !customerEmail) {
    console.warn(`[telegramListener] ⚠️ Cannot send approval email: No email found for policy ${policyNumber}`);
  }
}

/**
 * Starts continuous Long Polling listener for Telegram bot button clicks.
 */
export async function startTelegramListener(): Promise<void> {
  if (isListening) return;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.warn('[telegramListener] TELEGRAM_BOT_TOKEN missing.');
    return;
  }

  isListening = true;

  // Make sure conflicting webhooks are cleared
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook`);
  } catch (err) {}

  console.log('[telegramListener] 🤖 Telegram Long-Polling Listener started (listening for [Approve] / [Reject] button clicks)...');

  let offset = 0;

  const poll = async () => {
    while (isListening) {
      try {
        const url = `https://api.telegram.org/bot${botToken}/getUpdates?offset=${offset}&timeout=25&allowed_updates=["callback_query","message"]`;
        const res = await fetch(url);
        const data = (await res.json()) as { ok: boolean; result?: any[] };

        if (data.ok && Array.isArray(data.result)) {
          for (const update of data.result) {
            offset = update.update_id + 1;
            if (update.callback_query) {
              await handleCallbackQuery(update.callback_query, botToken);
            }
          }
        }
      } catch (err) {
        // Wait 4 seconds on network glitch before reconnecting
        await new Promise(r => setTimeout(r, 4000));
      }
    }
  };

  poll().catch(err => {
    console.error('[telegramListener] Poll loop error:', err);
    isListening = false;
  });
}

export function stopTelegramListener(): void {
  isListening = false;
  console.log('[telegramListener] 🛑 Telegram Listener stopped');
}
