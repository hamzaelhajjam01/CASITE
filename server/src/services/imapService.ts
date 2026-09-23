import { ImapFlow } from 'imapflow';
import { simpleParser, type Attachment } from 'mailparser';
import { getDB } from '../db/client.js';
import type { PolicyDoc } from '../types/index.js';
import { sendPaymentReceivedEmail } from './emailService.js';

let isRunning = false;
let isChecking = false;
let pollTimer: NodeJS.Timeout | null = null;

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Extracts quote or policy reference numbers (e.g. PQ235117786, PG123456)
 */
function extractRef(text: string): string {
  const match = text.match(/#(P[Q|G]\d+)/i) || text.match(/\b(P[Q|G]\d{6,14})\b/i);
  return match ? match[1].toUpperCase() : '';
}

/**
 * Forwards receipt attachment & details to the broker's Telegram group
 */
async function sendToTelegram(
  htmlCaption: string,
  policyNumber: string,
  attachment?: Attachment
): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN || '8952394310:AAHaQ2Ap69V9goclo3beWwz1_Fgr02V6Wo8';
  const chatId = process.env.TELEGRAM_CHAT_ID || '-1003584220577';
  if (!botToken || !chatId) {
    console.warn('[imapService] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing.');
    return false;
  }

  const replyMarkup = JSON.stringify({
    inline_keyboard: [
      [
        { text: '✅ Approve & Activate', callback_data: `approve:${policyNumber}` },
        { text: '❌ Reject', callback_data: `reject:${policyNumber}` },
      ],
    ],
  });

  try {
    if (attachment && attachment.content) {
      const form = new FormData();
      form.append('chat_id', chatId);
      form.append('caption', htmlCaption);
      form.append('parse_mode', 'HTML');
      form.append('reply_markup', replyMarkup);

      const mime = attachment.contentType || 'image/png';
      const filename = attachment.filename || 'payment_receipt.png';
      const blob = new Blob([new Uint8Array(attachment.content)], { type: mime });

      const isImage = mime.startsWith('image/') || /\.(png|jpe?g|webp|heic)$/i.test(filename);
      const method = isImage ? 'sendPhoto' : 'sendDocument';
      const field = isImage ? 'photo' : 'document';
      form.append(field, blob, filename);

      let res = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, { method: 'POST', body: form });
      let data = (await res.json()) as { ok: boolean; description?: string };

      if (!data.ok && isImage) {
        console.warn('[imapService] sendPhoto failed:', data.description, '— retrying as document');
        const docForm = new FormData();
        docForm.append('chat_id', chatId);
        docForm.append('caption', htmlCaption);
        docForm.append('parse_mode', 'HTML');
        docForm.append('reply_markup', replyMarkup);
        docForm.append('document', blob, filename);
        res = await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, { method: 'POST', body: docForm });
        data = (await res.json()) as { ok: boolean; description?: string };
      }

      console.log(`[imapService] ✅ Telegram notification sent for ${policyNumber} (Result: ${data.ok})`);
      return data.ok;
    } else {
      // Send text message
      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: htmlCaption,
          parse_mode: 'HTML',
          reply_markup: JSON.parse(replyMarkup),
        }),
      });
      const data = (await res.json()) as { ok: boolean };
      console.log(`[imapService] ✅ Telegram text notification sent for ${policyNumber} (Result: ${data.ok})`);
      return data.ok;
    }
  } catch (err) {
    console.error('[imapService] ❌ Failed to forward to Telegram:', (err as Error).message);
    return false;
  }
}

/**
 * Checks INBOX for new unread payment confirmation replies.
 */
export async function checkIncomingEmailsOnce(): Promise<number> {
  if (isChecking) return 0;
  isChecking = true;

  const imapUser = process.env.IMAP_USER || 'contact@polarguardbrokerage.ca';
  const imapPass = process.env.IMAP_PASS || 'HayAtTZEB3250@@.';

  const client = new ImapFlow({
    host: process.env.IMAP_HOST || 'imap.hostinger.com',
    port: Number(process.env.IMAP_PORT) || 993,
    secure: true,
    auth: { user: imapUser, pass: imapPass },
    logger: false,
  });

  let processedCount = 0;

  try {
    await client.connect();
    const lock = await client.getMailboxLock('INBOX');

    try {
      // 1. Collect unseen UIDs first so the socket is free for sequential downloads
      const unseenUids: number[] = [];
      for await (const msg of client.fetch({ seen: false }, { uid: true })) {
        unseenUids.push(msg.uid);
      }

      if (unseenUids.length > 0) {
        console.log(`[imapService] Found ${unseenUids.length} unseen email(s) in INBOX:`, unseenUids);
      }

      // 2. Process each email sequentially
      for (const uid of unseenUids) {
        try {
          const raw = await client.download(uid.toString(), undefined, { uid: true });
          const parsed = await simpleParser(raw.content);

          const senderEmail = parsed.from?.value?.[0]?.address || '';
          const senderName = parsed.from?.value?.[0]?.name || 'Valued Customer';
          const subject = parsed.subject || '';
          const bodyText = (parsed.text || '').replace(/\r\n/g, '\n').trim();

          console.log(`[imapService] Evaluating UID ${uid}: "${subject}" from <${senderEmail}>`);

          // Skip emails sent from ourselves
          if (senderEmail.toLowerCase() === imapUser.toLowerCase()) {
            await client.messageFlagsAdd({ uid }, ['\\Seen'], { uid: true });
            continue;
          }

          // Look for image or PDF attachments (payment receipt / confirmation)
          const receiptAttachment = parsed.attachments.find(
            att =>
              att.contentType.startsWith('image/') ||
              att.contentType === 'application/pdf' ||
              /\.(png|jpe?g|webp|heic|pdf)$/i.test(att.filename || '')
          );

          // Find policy in DB by reference or by sender email
          const detectedRef = extractRef(subject + ' ' + bodyText);
          const db = getDB();

          let policy: PolicyDoc | null = null;
          if (detectedRef) {
            policy = await db.collection<PolicyDoc>('policies').findOne({
              $or: [{ policy_number: detectedRef }, { ref_num: detectedRef }],
            });
          }
          if (!policy && senderEmail) {
            policy = await db.collection<PolicyDoc>('policies').findOne(
              { customer_email: senderEmail.toLowerCase() },
              { sort: { updated_at: -1 } }
            );
          }

          const policyNum = policy?.policy_number || detectedRef || `PG${Date.now().toString().slice(-8)}`;

          // Check if this is a payment reply
          const isPaymentReply =
            Boolean(receiptAttachment) ||
            /payment|transfer|interac|sent|paid|receipt|attached|confirmation/i.test(subject + ' ' + bodyText);

          if (isPaymentReply) {
            console.log(`[imapService] 📩 Received payment reply from ${senderEmail} (Policy #${policyNum})`);

            // 1. Update policy in MongoDB
            if (policy) {
              await db.collection<PolicyDoc>('policies').updateOne(
                { policy_number: policy.policy_number },
                {
                  $set: {
                    status: 'pending',
                    receipt_name: receiptAttachment?.filename || 'email_receipt.jpg',
                    updated_at: new Date(),
                  },
                }
              );
            }

            // 2. Build Telegram notification caption (HTML mode for safety)
            const firstLineOfBody = bodyText.split('\n').filter(l => l.trim().length > 0)[0] || '';
            const captionLines = [
              `📋 <b>New Payment Submission (Via Email Reply)</b>`,
              ``,
              `<b>Policy:</b> <code>${escapeHTML(policyNum)}</code>`,
              detectedRef ? `<b>Quote Ref:</b> <code>#${escapeHTML(detectedRef)}</code>` : null,
              `<b>Customer:</b> ${escapeHTML(policy?.customer_name || senderName)}`,
              `<b>Email:</b> ${escapeHTML(senderEmail)}`,
              policy?.customer_phone ? `<b>Phone:</b> ${escapeHTML(policy.customer_phone)}` : null,
              policy?.vehicle ? `<b>Vehicle:</b> ${escapeHTML(policy.vehicle)}` : null,
              policy?.vin ? `<b>VIN:</b> <code>${escapeHTML(policy.vin)}</code>` : null,
              policy?.amount ? `<b>Amount:</b> $${policy.amount} CAD` : null,
              policy?.billing_frequency ? `<b>Payment Plan:</b> ${policy.billing_frequency === 'monthly' ? '📅 Monthly' : '🛡️ Full Term'}` : null,
              firstLineOfBody ? `<b>Customer Note:</b> <i>"${escapeHTML(firstLineOfBody.slice(0, 140))}"</i>` : null,
              ``,
              `<b>Status:</b> ⏳ Pending Broker Verification`,
            ].filter(Boolean) as string[];

            const caption = captionLines.join('\n');

            // 3. Send to Telegram
            await sendToTelegram(caption, policyNum, receiptAttachment);

            // 4. Send automated acknowledgment email back to customer
            if (senderEmail && policy?.amount) {
              sendPaymentReceivedEmail(
                senderEmail,
                policy.customer_name || senderName,
                policyNum,
                policy.amount,
                policy.vehicle || 'Your vehicle'
              ).catch(err => {
                console.error('[imapService] Automated confirmation email error:', (err as Error).message);
              });
            }

            processedCount++;
          }

          // Mark message as seen so it's not processed repeatedly
          await client.messageFlagsAdd({ uid }, ['\\Seen'], { uid: true });
        } catch (msgErr) {
          console.error(`[imapService] Error processing email UID ${uid}:`, (msgErr as Error).message);
        }
      }
    } finally {
      lock.release();
    }

    await client.logout();
  } catch (err) {
    console.error('[imapService] IMAP connection/check error:', (err as Error).message);
  } finally {
    isChecking = false;
  }

  return processedCount;
}

/**
 * Starts continuous background polling of the Hostinger INBOX for payment replies.
 */
export function startIMAPListener(intervalMs = 25000): void {
  if (isRunning) return;
  isRunning = true;

  console.log(`[imapService] 🔄 Hostinger IMAP Listener started (polling every ${intervalMs / 1000}s)`);

  // Initial check immediately on start
  checkIncomingEmailsOnce().catch(() => {});

  // Recurring polling
  pollTimer = setInterval(() => {
    checkIncomingEmailsOnce().catch(() => {});
  }, intervalMs);
}

export function stopIMAPListener(): void {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  isRunning = false;
  console.log('[imapService] 🛑 Hostinger IMAP Listener stopped');
}
