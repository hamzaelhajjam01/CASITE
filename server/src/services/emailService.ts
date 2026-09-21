import nodemailer from 'nodemailer';
import type { SendMailOptions } from 'nodemailer';
import fs from 'fs';
import path from 'path';

// ─── Transporter Initialization ──────────────────────────────────────────
const smtpHost = process.env.SMTP_HOST || 'smtp-mail.outlook.com';
const smtpPort = Number(process.env.SMTP_PORT) || 587;
const smtpSecure = process.env.SMTP_SECURE === 'true';
const smtpUser = process.env.SMTP_USER || process.env.ADMIN_EMAIL || '';
const smtpPass = process.env.SMTP_PASS || '';
const fromName = process.env.FROM_NAME || 'PolarGuard Customer Operations';
const fromEmail = process.env.FROM_EMAIL || smtpUser;

export const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
});

/**
 * Sends payment confirmation & attached document to the customer
 * when an order/policy is approved via Telegram.
 */
export async function sendApprovalEmail(
  toEmail: string,
  customerName: string,
  policyNumber: string,
  attachmentPath?: string
): Promise<boolean> {
  if (!smtpUser || !smtpPass) {
    console.warn('[emailService] SMTP_USER or SMTP_PASS not set in .env. Skipping email dispatch.');
    return false;
  }

  const attachments: Array<{ filename: string; path: string }> = [];
  if (attachmentPath && fs.existsSync(attachmentPath)) {
    attachments.push({
      filename: path.basename(attachmentPath),
      path: attachmentPath,
    });
  }

  const mailOptions: SendMailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to: toEmail,
    subject: `Official Canadian TD Insurance Pink Card & Policy Approval — #${policyNumber}`,
    text: [
      `Dear ${customerName || 'Valued Customer'},`,
      ``,
      `Your payment verification has been successfully approved!`,
      `Policy Reference Number: ${policyNumber}`,
      ``,
      `Your official Canadian TD Insurance Motor Vehicle Liability Card (Pink Slip PDF) is attached to this email.`,
      ``,
      `• You may save this PDF on your smartphone or print it out — both forms are legally accepted as statutory proof of auto insurance across Canada.`,
      `• Your policy is now active and officially registered with the provincial database.`,
      ``,
      `Thank you for choosing PolarGuard Insurance Brokerage (in association with TD Insurance).`,
      ``,
      `If you need to make changes to your coverage or have any questions, our brokerage team is available 24/7. Simply reply to this email, email us at contact@polarguardbrokerage.ca, or reach us on WhatsApp at +1 (579) 987-7798 for instant support.`,
      ``,
      `Warm regards,`,
      `PolarGuard Underwriting & Operations`,
      `Email: contact@polarguardbrokerage.ca | WhatsApp (Instant Support): +1 (579) 987-7798`,
    ].join('\n'),
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Your Policy Approved & Pink Slip Issued</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #081826 0%, #168A5A 100%); color: #ffffff; padding: 32px 28px; text-align: left; }
    .brand-badge { display: inline-block; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 800; color: #ffffff; letter-spacing: 0.08em; margin-bottom: 12px; }
    .ref-badge { display: inline-block; background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.3); border-radius: 999px; padding: 4px 14px; font-size: 12px; font-weight: 600; margin-top: 14px; }
    .content { padding: 28px; font-size: 14px; line-height: 1.6; color: #334155; }
    .card-banner { background: #fdf2f8; border: 1.5px solid #f472b6; border-radius: 12px; padding: 16px; margin: 20px 0; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand-badge">POLARGUARD <span style="color: #86efac;">INSURANCE</span></div>
      <h1 style="margin: 0 0 6px 0; font-size: 22px; font-weight: 700;">✅ Payment Verified — Policy Approved!</h1>
      <p style="margin: 0; font-size: 13px; opacity: 0.9;">Your Canadian TD Pink Card has been issued and registered.</p>
      <div class="ref-badge">POLICY #${policyNumber}</div>
    </div>

    <div class="content">
      <p>Dear <strong>${customerName || 'Valued Customer'}</strong>,</p>
      <p>We are pleased to inform you that your payment has been verified and your auto insurance policy is <strong>officially active and in good standing</strong>.</p>

      <div class="card-banner">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td>
              <div style="font-weight: 700; color: #be185d; font-size: 14px;">🪪 Canadian TD Pink Card Attached</div>
              <div style="font-size: 12px; color: #db2777; margin-top: 3px;">Official Motor Vehicle Liability Insurance Card (PDF)</div>
            </td>
            <td style="text-align: right;">
              <span style="font-size: 11px; background: #be185d; color: #ffffff; padding: 6px 14px; border-radius: 6px; font-weight: 700;">ATTACHED</span>
            </td>
          </tr>
        </table>
      </div>

      <div style="background: #F0FDF4; border: 1px solid #A7DAB9; border-radius: 10px; padding: 14px; margin: 20px 0; font-size: 13px; color: #081826;">
        <strong>How to use your Pink Card:</strong>
        <ul style="margin: 8px 0 0 0; padding-left: 18px; line-height: 1.5;">
          <li><strong>Digital Proof:</strong> You can save this PDF directly on your smartphone (Apple Wallet / Files / Google Drive) — digital pink cards are legally accepted by police and registries across Canada.</li>
          <li><strong>Printed Copy:</strong> You may also print a physical copy to keep in your vehicle's glove compartment.</li>
        </ul>
      </div>

      <p style="font-size: 13px; color: #64748b; margin-top: 24px; line-height: 1.5;">
        If you need to make changes to your coverage or have any questions, our brokerage team is available 24/7. Simply reply to this email, reach us at <a href="mailto:contact@polarguardbrokerage.ca" style="color: #168A5A; text-decoration: none; font-weight: 600;">contact@polarguardbrokerage.ca</a>, or contact our team on WhatsApp at <a href="https://wa.me/15799877798" style="color: #168A5A; text-decoration: none; font-weight: 700;">+1 (579) 987-7798</a> for <strong>instant support</strong>.
      </p>
    </div>

    <div class="footer">
      <strong>PolarGuard Insurance Operations</strong><br>
      Underwritten by TD General Insurance Company · AMF Reg #504108 / RIBO Reg #10129<br>
      Email: <a href="mailto:contact@polarguardbrokerage.ca" style="color: #94a3b8;">contact@polarguardbrokerage.ca</a> &nbsp;|&nbsp; WhatsApp (Instant Support): <a href="https://wa.me/15799877798" style="color: #168A5A; text-decoration: none; font-weight: 600;">+1 (579) 987-7798</a>
    </div>
  </div>
</body>
</html>
    `,
    attachments,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[emailService] ✅ Approval email dispatched to ${toEmail} (Message ID: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error(`[emailService] ❌ Failed to send approval email to ${toEmail}:`, (error as Error).message);
    return false;
  }
}

/**
 * Sends initial confirmation and payment instructions to a customer.
 */
export async function sendPaymentInstructionsEmail(
  toEmail: string,
  customerName: string,
  policyNumber: string,
  amount: number,
  interacEmail: string = 'polarguardfinance@hotmail.com'
): Promise<boolean> {
  if (!smtpUser || !smtpPass) {
    console.warn('[emailService] SMTP credentials missing in .env');
    return false;
  }

  const mailOptions: SendMailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to: toEmail,
    subject: `Payment Instructions — Reference #${policyNumber}`,
    text: [
      `Hi ${customerName || 'there'},`,
      ``,
      `Thank you for submitting your details. Here are your payment instructions to finalize your policy #${policyNumber}:`,
      ``,
      `Amount Due: ${amount} CAD`,
      `Interac e-Transfer Email: ${interacEmail}`,
      `Recipient Name: DESOLOC LLC`,
      ``,
      `Once sent, please reply to this email with a screenshot of your transfer confirmation, and your file will be approved and sent to you immediately!`,
      ``,
      `If you have any questions or need instant support, simply reply to this email, contact us at contact@polarguardbrokerage.ca, or reach our team on WhatsApp at +1 (579) 987-7798 for instant support.`,
      ``,
      `PolarGuard Operations`,
      `Email: contact@polarguardbrokerage.ca | WhatsApp (Instant Support): +1 (579) 987-7798`,
    ].join('\n'),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[emailService] ✅ Payment instructions sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error(`[emailService] ❌ Error sending payment instructions:`, (error as Error).message);
    return false;
  }
}

/**
 * Sends a confirmation email to the customer that their payment receipt was uploaded and is being reviewed.
 */
export async function sendPaymentReceivedEmail(
  toEmail: string,
  customerName: string,
  policyNumber: string,
  amount: number,
  vehicle: string
): Promise<boolean> {
  if (!smtpUser || !smtpPass) {
    console.warn('[emailService] SMTP credentials missing in .env');
    return false;
  }

  const mailOptions: SendMailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to: toEmail,
    subject: `Payment Receipt Received — Policy Reference #${policyNumber}`,
    text: [
      `Hi ${customerName || 'Valued Customer'},`,
      ``,
      `We have received your payment confirmation for policy #${policyNumber}.`,
      ``,
      `Details of your submission:`,
      `• Vehicle: ${vehicle}`,
      `• Total Amount: $${amount} CAD`,
      `• Reference #: ${policyNumber}`,
      ``,
      `A licensed insurance broker is currently reviewing and verifying your Interac e-Transfer receipt.`,
      `Once confirmed (typically within 15-25 minutes during business hours), your official TD Insurance pink card and full coverage documents will be issued and delivered directly to this email address.`,
      ``,
      `If you have any questions or need to update your policy information, simply reply to this email, contact us at contact@polarguardbrokerage.ca, or reach our team on WhatsApp at +1 (579) 987-7798 for instant support.`,
      ``,
      `Best regards,`,
      `PolarGuard Insurance Operations`,
      `Email: contact@polarguardbrokerage.ca | WhatsApp (Instant Support): +1 (579) 987-7798`,
    ].join('\n'),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[emailService] ✅ Payment received email dispatched to ${toEmail} (ID: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error(`[emailService] ❌ Failed sending payment received email to ${toEmail}:`, (error as Error).message);
    return false;
  }
}

export interface QuoteSummaryEmailData {
  toEmail: string;
  customerName: string;
  policyNumber: string;
  refNum?: string;
  vehicle: string;
  vin: string;
  extraVehicles?: string[];
  coverageType: string;
  deductible: string;
  term: string;
  termLabel: string;
  billingFrequency: 'full' | 'monthly';
  dueToday: number;
  totalPrice: number;
  monthlyPrice: number;
  additionalDrivers?: string;
  interacEmail?: string;
  attachmentPath?: string;
}

/**
 * Sends official quote breakdown, payment instructions, and attaches the generated quote PDF
 * to the customer upon submitting their demand in the quote flow.
 */
export async function sendQuoteSummaryEmail(data: QuoteSummaryEmailData): Promise<boolean> {
  if (!smtpUser || !smtpPass) {
    console.warn('[emailService] SMTP credentials missing in .env');
    return false;
  }

  const {
    toEmail,
    customerName,
    policyNumber,
    refNum,
    vehicle,
    vin,
    extraVehicles,
    coverageType,
    deductible,
    termLabel,
    billingFrequency,
    dueToday,
    totalPrice,
    additionalDrivers,
    interacEmail = 'polarguardfinance@hotmail.com',
    attachmentPath,
  } = data;

  const isMonthly = billingFrequency === 'monthly';
  const displayCoverage = coverageType === 'full' ? 'Full Coverage (Comprehensive & Collision)' : 'Basic Liability Coverage';
  const displayDeductible = coverageType === 'full' ? `$${deductible} CAD` : 'N/A (Basic)';
  const displayRef = refNum || policyNumber;

  const textBody = [
    `Dear ${customerName || 'Valued Client'},`,
    ``,
    `We have received your demand for an auto insurance quote with PolarGuard Brokerage (in association with TD Insurance Canada).`,
    ``,
    `Your official Automobile Insurance Quote document has been generated and is attached to this email as a PDF (PolarGuard_Official_Quote_${displayRef}.pdf).`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `OFFICIAL QUOTE SUMMARY — REF #${displayRef}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `• Primary Vehicle: ${vehicle}`,
    `• VIN: ${vin}`,
    extraVehicles && extraVehicles.length > 0 ? `• Extra Vehicles: ${extraVehicles.join(', ')} (20% Bundle Applied)` : null,
    `• Primary Driver: ${customerName || 'Insured'}`,
    additionalDrivers ? `• Additional Drivers: ${additionalDrivers} (Included Free · $0)` : `• Additional Drivers: None`,
    `• Coverage Tier: ${displayCoverage}`,
    `• Deductible: ${displayDeductible}`,
    `• Policy Term: ${termLabel || '6 months prepaid'}`,
    `• Payment Plan: ${isMonthly ? 'Monthly Installments via Interac e-Transfer' : 'Full Term Prepaid (One-Time)'}`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `AMOUNT DUE TODAY TO ACTIVATE: $${dueToday} CAD ${isMonthly ? '(Month 1 Installment)' : '(Full Term Total)'}`,
    isMonthly ? `Total Term Premium: $${totalPrice} CAD (remaining installments of $${dueToday}/mo)` : `Total Term Premium: $${totalPrice} CAD (covered for full term, no further billing)`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `HOW TO ACTIVATE YOUR POLICY & RECEIVE YOUR TD PINK SLIP:`,
    `1. Open your Canadian online banking app (RBC, TD, Scotiabank, BMO, CIBC, Tangerine, Desjardins, etc.).`,
    `2. Send an Interac e-Transfer for $${dueToday} CAD to:`,
    `   - Recipient Email: ${interacEmail}`,
    `   - Registered Business: DESOLOC LLC`,
    `3. Once sent, simply reply to this email with a screenshot of your transfer confirmation (or your Interac reference number).`,
    `4. Our underwriting team will verify your receipt and immediately email your official Canadian TD Pink Slip (Motor Vehicle Liability Card PDF) within 15–25 minutes.`,
    ``,
    `Please review the attached PDF document for your full schedule of coverages and terms.`,
    `Need help or want to adjust details? Simply reply to this email, reach us at contact@polarguardbrokerage.ca, or contact us on WhatsApp at +1 (579) 987-7798 for instant support.`,
    ``,
    `Warm regards,`,
    `PolarGuard Underwriting & Operations`,
    `Email: contact@polarguardbrokerage.ca | WhatsApp (Instant Support): +1 (579) 987-7798`,
  ].filter(Boolean).join('\n');

  const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your PolarGuard Insurance Quote</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #081826 0%, #168A5A 100%); color: #ffffff; padding: 32px 28px; text-align: left; }
    .header h1 { margin: 0 0 6px 0; font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
    .header p { margin: 0; font-size: 13px; opacity: 0.88; }
    .brand-badge { display: inline-block; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; padding: 4px 10px; font-size: 11px; font-weight: 800; color: #ffffff; letter-spacing: 0.08em; margin-bottom: 12px; text-transform: uppercase; }
    .ref-badge { display: inline-block; background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.3); border-radius: 999px; padding: 4px 14px; font-size: 12px; font-weight: 600; margin-top: 14px; letter-spacing: 0.05em; }
    .content { padding: 28px; }
    .greeting { font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 20px; }
    .pdf-badge { background: #F0FDF4; border: 1.5px solid #A7DAB9; border-radius: 12px; padding: 14px 18px; margin-bottom: 22px; }
    .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #168A5A; margin: 24px 0 12px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
    .summary-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .summary-table td { padding: 9px 0; font-size: 13.5px; border-bottom: 1px solid #f1f5f9; }
    .summary-table td.label { color: #64748b; width: 42%; font-weight: 500; }
    .summary-table td.value { color: #081826; font-weight: 600; text-align: right; }
    .price-card { background: #F0FDF4; border: 2px solid #86efac; border-radius: 14px; padding: 20px; text-align: center; margin: 24px 0; }
    .price-sub { font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.1em; color: #168A5A; margin-bottom: 6px; }
    .price-num { font-size: 38px; font-weight: 800; color: #168A5A; line-height: 1; margin-bottom: 6px; }
    .price-note { font-size: 12.5px; color: #166534; margin: 0; line-height: 1.4; }
    .footer { background: #f8fafc; padding: 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand-badge">POLARGUARD <span style="color: #86efac;">INSURANCE</span></div>
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; opacity: 0.85; margin-bottom: 4px;">PolarGuard Brokerage · Underwritten by TD Insurance</div>
      <h1>We Received Your Demand — Official Quote</h1>
      <p>Your demand has been processed and your official quote PDF is generated.</p>
      <div class="ref-badge">REFERENCE #${displayRef}</div>
    </div>

    <div class="content">
      <span style="display:none !important; font-size:0; line-height:0; max-height:0; opacity:0; color:transparent; mso-hide:all; visibility:hidden;">[PolarGuard Quote Ref: ${displayRef} · Generated: ${new Date().toISOString()}]</span>
      <p class="greeting">
        Dear <strong>${customerName || 'Valued Client'}</strong>,<br>
        We have received your demand for an auto insurance quote with PolarGuard Insurance Brokerage. Your customized quote is attached to this email as a PDF document. Below is your detailed coverage summary and instructions to issue your official Canadian TD Pink Card.
      </p>

      <div class="pdf-badge">
        <table style="width: 100%; border: none;">
          <tr>
            <td style="border: none; padding: 0;">
              <div style="font-weight: 700; color: #166534; font-size: 13.5px;">📄 Official Quote PDF Attached</div>
              <div style="font-size: 12px; color: #168A5A; margin-top: 2px;">PolarGuard_Official_Quote_${displayRef}.pdf (${displayCoverage})</div>
            </td>
            <td style="border: none; padding: 0; text-align: right;">
              <span style="font-size: 11px; background: #168A5A; color: #ffffff; padding: 5px 12px; border-radius: 6px; font-weight: 700; letter-spacing: 0.05em;">ATTACHED</span>
            </td>
          </tr>
        </table>
      </div>

      <div class="section-title">Coverage &amp; Vehicle Summary</div>
      <table class="summary-table">
        <tr>
          <td class="label">Primary Vehicle</td>
          <td class="value">${vehicle}</td>
        </tr>
        <tr>
          <td class="label">VIN</td>
          <td class="value"><code style="font-family: monospace; background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${vin}</code></td>
        </tr>
        ${extraVehicles && extraVehicles.length > 0 ? `
        <tr>
          <td class="label">Additional Vehicles</td>
          <td class="value">${extraVehicles.join(', ')} <span style="color: #168a5a; font-size: 11px;">(20% Bundle Discount)</span></td>
        </tr>` : ''}
        <tr>
          <td class="label">Primary Driver</td>
          <td class="value">${customerName || 'Insured'}</td>
        </tr>
        <tr>
          <td class="label">Additional Drivers</td>
          <td class="value">${additionalDrivers ? `${additionalDrivers} <span style="color: #168a5a; font-size: 11px;">(Free · $0)</span>` : 'None (Included Free)'}</td>
        </tr>
        <tr>
          <td class="label">Coverage Tier</td>
          <td class="value">${displayCoverage}</td>
        </tr>
        <tr>
          <td class="label">Deductible</td>
          <td class="value">${displayDeductible}</td>
        </tr>
        <tr>
          <td class="label">Policy Term</td>
          <td class="value">${termLabel || '6 months prepaid'}</td>
        </tr>
        <tr>
          <td class="label">Payment Plan</td>
          <td class="value">${isMonthly ? 'Monthly Installments' : 'Full Term Prepaid (One-Time)'}</td>
        </tr>
      </table>

      <div class="price-card">
        <div class="price-sub">${isMonthly ? 'Amount Due Today (Month 1)' : 'Total Due Today'}</div>
        <div class="price-num">$${dueToday} <span style="font-size: 16px; font-weight: 500;">CAD${isMonthly ? ' / mo' : ''}</span></div>
        <p class="price-note">
          ${isMonthly
            ? `Month 1 due today to issue your TD pink slip. Remaining installments of $${dueToday} CAD billed monthly via Interac e-Transfer (Total $${totalPrice} CAD).`
            : `One-time payment covering your vehicle for the full ${termLabel}. No recurring monthly charges.`}
        </p>
      </div>

      <div class="section-title">How to Activate &amp; Receive Your Pink Slip</div>
      
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 14px; margin: 20px 0; border-collapse: separate;">
        <tr>
          <td style="padding: 20px;">

            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 16px;">
              <tr>
                <td width="36" valign="top" style="width: 36px; min-width: 36px; max-width: 36px; vertical-align: top; padding-top: 1px;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="26" height="26" style="width: 26px !important; min-width: 26px !important; max-width: 26px !important; height: 26px !important; background-color: #168A5A; border-radius: 50%; border-collapse: collapse;">
                    <tr>
                      <td align="center" valign="middle" style="width: 26px; height: 26px; color: #ffffff; font-size: 12px; font-weight: 700; text-align: center; vertical-align: middle; line-height: 26px; font-family: Arial, sans-serif;">1</td>
                    </tr>
                  </table>
                </td>
                <td valign="top" style="vertical-align: top; padding-left: 6px; font-size: 13.5px; line-height: 1.5; color: #334155;">
                  <strong style="color: #081826;">Send Interac e-Transfer:</strong> Open your Canadian online banking app (TD, RBC, Scotiabank, BMO, CIBC, Tangerine, Desjardins, etc.) and send <strong style="color: #168A5A;">$${dueToday} CAD</strong>:
                  
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border: 1.5px dashed #A7DAB9; border-radius: 10px; margin-top: 10px; border-collapse: separate;">
                    <tr>
                      <td style="padding: 12px 16px;">
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td style="padding: 3px 0; color: #64748b; font-size: 12.5px; font-weight: 500; width: 140px;">Recipient Name:</td>
                            <td style="padding: 3px 0; font-weight: 700; color: #081826; font-size: 13px;">DESOLOC LLC</td>
                          </tr>
                          <tr>
                            <td style="padding: 3px 0; color: #64748b; font-size: 12.5px; font-weight: 500;">Email:</td>
                            <td style="padding: 3px 0; font-weight: 700; color: #168A5A; font-family: monospace; font-size: 13px;">${interacEmail}</td>
                          </tr>
                          <tr>
                            <td style="padding: 3px 0; color: #64748b; font-size: 12.5px; font-weight: 500;">Amount:</td>
                            <td style="padding: 3px 0; font-weight: 800; color: #168A5A; font-size: 13.5px;">$${dueToday}.00 CAD</td>
                          </tr>
                          <tr>
                            <td style="padding: 3px 0; color: #64748b; font-size: 12.5px; font-weight: 500;">Message / Memo:</td>
                            <td style="padding: 3px 0; font-weight: 700; color: #081826; font-family: monospace; font-size: 13px;">Quote #${displayRef}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 16px;">
              <tr>
                <td width="36" valign="top" style="width: 36px; min-width: 36px; max-width: 36px; vertical-align: top; padding-top: 1px;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="26" height="26" style="width: 26px !important; min-width: 26px !important; max-width: 26px !important; height: 26px !important; background-color: #168A5A; border-radius: 50%; border-collapse: collapse;">
                    <tr>
                      <td align="center" valign="middle" style="width: 26px; height: 26px; color: #ffffff; font-size: 12px; font-weight: 700; text-align: center; vertical-align: middle; line-height: 26px; font-family: Arial, sans-serif;">2</td>
                    </tr>
                  </table>
                </td>
                <td valign="top" style="vertical-align: top; padding-left: 6px; font-size: 13.5px; line-height: 1.5; color: #334155;">
                  <strong style="color: #081826;">Reply with Payment Screenshot:</strong> Once you have sent the transfer, simply <strong>reply directly to this email with a screenshot of your confirmation</strong> (or your Interac reference number).
                </td>
              </tr>
            </table>

            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td width="36" valign="top" style="width: 36px; min-width: 36px; max-width: 36px; vertical-align: top; padding-top: 1px;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="26" height="26" style="width: 26px !important; min-width: 26px !important; max-width: 26px !important; height: 26px !important; background-color: #168A5A; border-radius: 50%; border-collapse: collapse;">
                    <tr>
                      <td align="center" valign="middle" style="width: 26px; height: 26px; color: #ffffff; font-size: 12px; font-weight: 700; text-align: center; vertical-align: middle; line-height: 26px; font-family: Arial, sans-serif;">3</td>
                    </tr>
                  </table>
                </td>
                <td valign="top" style="vertical-align: top; padding-left: 6px; font-size: 13.5px; line-height: 1.5; color: #334155;">
                  <strong style="color: #081826;">Pink Slip Delivery:</strong> A licensed Canadian insurance broker verifies the receipt. Your official TD Insurance Canada Pink Slip (Motor Vehicle Liability Card PDF) is generated, registered with the provincial database, and delivered to <strong style="color: #168A5A;">${toEmail}</strong> within 15–25 minutes.
                </td>
              </tr>
            </table>

          </td>
        </tr>
      </table>

      <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-top: 20px;">
        Your detailed quote breakdown is attached as a PDF. Questions about your quote or need assistance with your transfer? Reply directly to this email, reach us at <a href="mailto:contact@polarguardbrokerage.ca" style="color: #168A5A; text-decoration: none; font-weight: 600;">contact@polarguardbrokerage.ca</a>, or contact our team on WhatsApp at <a href="https://wa.me/15799877798" style="color: #168A5A; text-decoration: none; font-weight: 700;">+1 (579) 987-7798</a> for <strong>instant support</strong>.
      </p>
    </div>

    <div class="footer">
      <strong>PolarGuard Insurance Operations</strong><br>
      Licensed Canadian Auto Insurance Brokerage · In association with TD Insurance<br>
      Email: <a href="mailto:contact@polarguardbrokerage.ca" style="color: #64748b;">contact@polarguardbrokerage.ca</a> &nbsp;|&nbsp; WhatsApp (Instant Support): <a href="https://wa.me/15799877798" style="color: #168A5A; text-decoration: none; font-weight: 600;">+1 (579) 987-7798</a>
    </div>
  </div>
</body>
</html>
`;

  const attachments: SendMailOptions['attachments'] = [];
  if (attachmentPath && fs.existsSync(attachmentPath)) {
    attachments.push({
      filename: `PolarGuard_Official_Quote_${displayRef}.pdf`,
      path: attachmentPath,
      contentType: 'application/pdf',
    });
  }

  const mailOptions: SendMailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to: toEmail,
    subject: `We Received Your Auto Insurance Demand — Official Quote #${displayRef} & Payment Instructions`,
    text: textBody,
    html: htmlBody,
    attachments,
    headers: {
      'X-Entity-Ref-ID': `${displayRef}-${Date.now()}`,
    },
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[emailService] ✅ Quote summary email dispatched to ${toEmail} with ${attachments.length} attachment(s) (Message ID: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error(`[emailService] ❌ Failed to dispatch quote email to ${toEmail}:`, (error as Error).message);
    return false;
  }
}


