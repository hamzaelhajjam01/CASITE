import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface QuotePDFData {
  policyNumber: string;
  refNum?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  licenseClass?: string;
  dob?: string;
  postal?: string;
  province?: string;
  vehicle: string;
  vin: string;
  extraVehicles?: string[];
  coverageType: string; // 'basic' | 'full'
  term: string;         // '1m' | '3m' | '6m' | '12m'
  termLabel: string;
  deductible: string;   // '500' | '1000'
  billingFrequency: 'full' | 'monthly';
  dueToday: number;
  totalPrice: number;
  monthlyPrice: number;
  additionalDrivers?: string;
  interacEmail?: string;
  companyName?: string;
}

function getBrowserPath(): string {
  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.EDGE_BIN,
    process.env.CHROME_BIN,
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/microsoft-edge',
  ].filter(Boolean) as string[];

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return '';
}

function getLogoBase64(): string {
  const candidates = [
    path.resolve(process.cwd(), 'assets', 'logo-dark.png'),
    path.resolve(process.cwd(), 'server', 'assets', 'logo-dark.png'),
    path.resolve(__dirname, '..', '..', 'assets', 'logo-dark.png'),
    path.resolve(__dirname, '..', '..', '..', 'app', 'public', 'images', 'logo-dark.png'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      try {
        const buf = fs.readFileSync(c);
        return `data:image/png;base64,${buf.toString('base64')}`;
      } catch {}
    }
  }
  return '';
}

/**
 * Builds professional, publication-quality HTML for the official PolarGuard quote document.
 */
export function buildQuoteHTML(data: QuotePDFData): string {
  const ref = data.refNum || data.policyNumber;
  const isMonthly = data.billingFrequency === 'monthly';
  const isFull = data.coverageType === 'full';
  const termMonths = data.term === '1m' ? 1 : data.term === '3m' ? 3 : data.term === '6m' ? 6 : 12;

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });

  const interacEmail = data.interacEmail || 'polarguardfinance@hotmail.com';
  const companyName = data.companyName || 'DESOLOC LLC';
  const logoBase64 = getLogoBase64();

  const deductibleText = isFull ? `$${data.deductible} CAD` : 'N/A (Basic)';
  const planName = isFull
    ? `${data.termLabel || `${termMonths}-Month`} Full Coverage Policy (Collision & Comprehensive)`
    : `${data.termLabel || `${termMonths}-Month`} Basic Liability & Statutory Protection`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>PolarGuard Official Automobile Quote #${ref}</title>
<style>
  @page {
    size: letter;
    margin: 10mm 14mm 10mm 14mm;
  }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, Helvetica, sans-serif;
    margin: 0;
    padding: 0;
    color: #111111;
    background: #ffffff;
    font-size: 11.5px;
    line-height: 1.4;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2.5px solid #168A5A;
    padding-bottom: 12px;
    margin-bottom: 14px;
  }
  .logo-box {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 3px;
  }
  .brand-logo {
    height: 40px;
    width: auto;
    max-width: 220px;
    object-fit: contain;
    display: block;
  }
  .sub-logo {
    font-size: 10px;
    color: #5F6368;
    margin-top: 2px;
    font-weight: 500;
    letter-spacing: 0.2px;
  }
  .doc-title {
    font-size: 13.5px;
    font-weight: 800;
    text-align: right;
    color: #081826;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .meta-text {
    font-size: 10.5px;
    text-align: right;
    color: #5F6368;
    margin-top: 2px;
  }
  .ref-pill {
    display: inline-block;
    background: #E8F5EE;
    color: #168A5A;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 4px;
    border: 1px solid #A7DAB9;
    margin-top: 3px;
    font-family: monospace;
    font-size: 11px;
  }
  .section-title {
    font-size: 11.5px;
    font-weight: 700;
    background: #F0FDF4;
    padding: 5px 10px;
    border-left: 4px solid #168A5A;
    margin-top: 12px;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #081826;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 10px;
  }
  th, td {
    padding: 6px 9px;
    border: 1px solid #dcdcdc;
    font-size: 11px;
    text-align: left;
    vertical-align: middle;
  }
  th {
    background-color: #F7F7F5;
    font-weight: 600;
    color: #081826;
  }
  .val-strong {
    font-weight: 700;
    color: #111111;
  }
  .badge-inc {
    background: #e6f7ec;
    color: #168a5a;
    font-weight: 700;
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    display: inline-block;
    border: 1px solid #a7dab9;
  }
  .badge-dec {
    background: #fff1f2;
    color: #be123c;
    font-weight: 600;
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    display: inline-block;
  }
  .price-highlight-box {
    background: #f0fdf4;
    border: 2px solid #86efac;
    border-radius: 8px;
    padding: 10px 14px;
    margin: 10px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .price-highlight-title {
    font-size: 11px;
    text-transform: uppercase;
    font-weight: 700;
    color: #15803d;
    margin-bottom: 2px;
  }
  .price-highlight-note {
    font-size: 10.5px;
    color: #166534;
    max-width: 420px;
  }
  .price-highlight-num {
    font-size: 24px;
    font-weight: 800;
    color: #166534;
    line-height: 1;
    text-align: right;
  }
  .price-highlight-sub {
    font-size: 10px;
    color: #15803d;
    font-weight: 600;
    text-align: right;
    margin-top: 2px;
  }
  .binding-notice {
    background: #F0FDF4;
    border: 1px solid #A7DAB9;
    border-radius: 6px;
    padding: 8px 12px;
    margin-top: 8px;
    margin-bottom: 10px;
    font-size: 10.5px;
    color: #081826;
    line-height: 1.45;
  }
  .payment-table th {
    background-color: #F0FDF4;
    color: #081826;
  }
  .footer {
    margin-top: 14px;
    border-top: 1px solid #e0e0e0;
    padding-top: 8px;
    font-size: 9.5px;
    color: #777777;
    text-align: center;
    line-height: 1.4;
  }
</style>
</head>
<body>

<div class="header">
  <div class="logo-box">
    ${logoBase64
      ? `<img src="${logoBase64}" alt="PolarGuard Insurance" class="brand-logo" />`
      : `<div style="font-size: 20px; font-weight: 800; color: #168A5A; letter-spacing: -0.5px;">PolarGuard Insurance</div>`
    }
    <div class="sub-logo">In Partner Network with TD General Insurance Company</div>
  </div>
  <div>
    <div class="doc-title">OFFICIAL AUTOMOBILE QUOTE &amp; BINDING ELIGIBILITY</div>
    <div class="meta-text">Date: <strong>${formattedDate}</strong></div>
    <div class="meta-text">Quote Ref: <span class="ref-pill">#${ref}</span></div>
  </div>
</div>

<div class="section-title">1. INSURED PROFILE &amp; VEHICLE SUMMARY</div>
<table>
  <tr>
    <th style="width: 22%;">Primary Insured</th>
    <td style="width: 28%;" class="val-strong">${data.customerName || 'Valued Customer'}</td>
    <th style="width: 22%;">Policy Underwriter</th>
    <td style="width: 28%;" class="val-strong">TD General Insurance Company</td>
  </tr>
  <tr>
    <th>Email Address</th>
    <td>${data.customerEmail}</td>
    <th>Brokerage Agency</th>
    <td>PolarGuard Direct Agency Inc.</td>
  </tr>
  <tr>
    <th>Driver's License</th>
    <td>${data.licenseClass || 'G'} Class ${data.dob ? `· DOB: ${data.dob}` : ''}</td>
    <th>Postal Code / Region</th>
    <td>${data.postal || 'Ontario'}${data.province ? ` (${data.province})` : ''}</td>
  </tr>
  <tr>
    <th>Insured Vehicle</th>
    <td class="val-strong">${data.vehicle}</td>
    <th>Vehicle VIN</th>
    <td style="font-family: monospace; font-weight: 700;">${data.vin}</td>
  </tr>
  ${data.extraVehicles && data.extraVehicles.length > 0 ? `
  <tr>
    <th>Additional Vehicles</th>
    <td colspan="3" class="val-strong">${data.extraVehicles.join(' · ')} <span class="badge-inc" style="margin-left: 6px;">20% Multi-Vehicle Discount Applied</span></td>
  </tr>` : ''}
  <tr>
    <th>Additional Drivers</th>
    <td colspan="3">${data.additionalDrivers ? `${data.additionalDrivers} <span class="badge-inc" style="margin-left: 6px;">Included Free · $0 Fee</span>` : 'Just Primary Insured (No extra fee)'}</td>
  </tr>
</table>

<div class="section-title">2. SCHEDULE OF COVERAGES &amp; BENEFIT LIMITS</div>
<table>
  <thead>
    <tr>
      <th style="width: 44%;">Coverage Type</th>
      <th style="width: 28%;">Statutory Limit</th>
      <th style="width: 14%;">Deductible</th>
      <th style="width: 14%;">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Third-Party Liability (Bodily Injury &amp; Property Damage)</strong></td>
      <td>$2,000,000.00 CAD ($2 Million)</td>
      <td>$0.00</td>
      <td><span class="badge-inc">INCLUDED</span></td>
    </tr>
    <tr>
      <td><strong>Direct Compensation - Property Damage (DCPD)</strong></td>
      <td>Statutory Full Replacement</td>
      <td>$0.00</td>
      <td><span class="badge-inc">INCLUDED</span></td>
    </tr>
    <tr>
      <td><strong>Statutory Accident Benefits &amp; Medical Limits</strong></td>
      <td>Provincial Statutory Maximums</td>
      <td>N/A</td>
      <td><span class="badge-inc">INCLUDED</span></td>
    </tr>
    <tr>
      <td><strong>Uninsured &amp; Unidentified Automobile Coverage</strong></td>
      <td>Statutory Maximum Limit</td>
      <td>$0.00</td>
      <td><span class="badge-inc">INCLUDED</span></td>
    </tr>
    <tr>
      <td><strong>Collision or Upset Coverage</strong></td>
      <td>${isFull ? 'Actual Cash Value (Full Vehicle Coverage)' : 'Not Selected (Basic Plan)'}</td>
      <td>${isFull ? deductibleText : 'N/A'}</td>
      <td>${isFull ? '<span class="badge-inc">INCLUDED</span>' : '<span class="badge-dec">DECLINED</span>'}</td>
    </tr>
    <tr>
      <td><strong>Comprehensive (Fire, Theft, Vandalism, Hail, Glass)</strong></td>
      <td>${isFull ? 'Actual Cash Value (Full Vehicle Coverage)' : 'Not Selected (Basic Plan)'}</td>
      <td>${isFull ? deductibleText : 'N/A'}</td>
      <td>${isFull ? '<span class="badge-inc">INCLUDED</span>' : '<span class="badge-dec">DECLINED</span>'}</td>
    </tr>
  </tbody>
</table>

<div class="section-title">3. PREMIUM BREAKDOWN &amp; PAYMENT SCHEDULE</div>
<table>
  <tr>
    <th style="width: 28%;">Selected Coverage Plan</th>
    <td class="val-strong">${planName}</td>
  </tr>
  <tr>
    <th>Policy Duration / Term</th>
    <td>${data.termLabel || `${termMonths} months prepaid`}</td>
  </tr>
  <tr>
    <th>Payment Plan</th>
    <td>${isMonthly ? `Equal Monthly Installments via Interac e-Transfer (${termMonths} payments)` : 'Full Term Prepaid (One-Time Payment)'}</td>
  </tr>
  <tr>
    <th>Total Policy Term Premium</th>
    <td class="val-strong">$${data.totalPrice}.00 CAD</td>
  </tr>
  <tr>
    <th>Initial Activation Payment (Due Today)</th>
    <td class="val-strong" style="color: #15803d; font-size: 12.5px;">$${data.dueToday}.00 CAD ${isMonthly ? '(Month 1 Installment)' : '(Full Term Total)'}</td>
  </tr>
</table>

<!-- Price Callout Box -->
<div class="price-highlight-box">
  <div>
    <div class="price-highlight-title">Amount Due Today to Activate Policy:</div>
    <div class="price-highlight-note">
      ${isMonthly
        ? `First month payment of <strong>$${data.dueToday}.00 CAD</strong> due today to bind and issue your TD Pink Card. Remaining ${termMonths - 1} equal installments of $${data.dueToday}.00 CAD billed monthly via Interac e-Transfer.`
        : `One-time payment of <strong>$${data.dueToday}.00 CAD</strong> covering your vehicle for the entire ${data.termLabel || `${termMonths} months`}. No monthly recurring charges.`}
    </div>
  </div>
  <div>
    <div class="price-highlight-num">$${data.dueToday}</div>
    <div class="price-highlight-sub">CAD ${isMonthly ? '/ month' : 'total'}</div>
  </div>
</div>

<div class="binding-notice">
  <strong>OFFICIAL PROOF OF QUOTATION &amp; BINDING ELIGIBILITY:</strong><br>
  This quotation document certifies guaranteed rating eligibility for ${data.customerName || 'the applicant'}. Upon verification of the initial activation payment of <strong>$${data.dueToday}.00 CAD</strong>, your official Canadian TD Pink Slip (Motor Vehicle Liability Card PDF) will be issued and registered with the provincial registry within 15–25 minutes.
</div>

<div class="section-title">4. INTERAC E-TRANSFER PAYMENT INSTRUCTIONS</div>
<table class="payment-table">
  <tr>
    <th style="width: 28%;">Payment Method</th>
    <td>Interac e-Transfer (Direct Canadian Online Banking)</td>
  </tr>
  <tr>
    <th>Recipient Business Name</th>
    <td class="val-strong">${companyName}</td>
  </tr>
  <tr>
    <th>Interac e-Transfer Email</th>
    <td class="val-strong" style="color: #168A5A; font-family: monospace; font-size: 12px;">${interacEmail}</td>
  </tr>
  <tr>
    <th>Amount to Send</th>
    <td class="val-strong" style="color: #15803d; font-size: 12px;">$${data.dueToday}.00 CAD</td>
  </tr>
  <tr>
    <th>Transfer Memo / Message</th>
    <td class="val-strong" style="font-family: monospace; font-size: 12px;">Quote #${ref}</td>
  </tr>
</table>

<div class="footer">
  PolarGuard Insurance Brokerage | Corporate Headquarters: 66 Wellington St W, 39th Floor, Toronto, ON M5K 1A2<br>
  Underwritten by TD General Insurance Company (AMF Reg #504108 / RIBO Reg #10129) · contact@polarguardbrokerage.ca
</div>

</body>
</html>
`;
}

/**
 * Generates an official quote PDF file on the server and returns its absolute path.
 */
export async function generateQuotePDF(data: QuotePDFData): Promise<string | null> {
  const browser = getBrowserPath();
  if (!browser) {
    console.warn('[pdfService] No browser binary found for headless PDF generation.');
    return null;
  }

  const ref = data.refNum || data.policyNumber;
  const quotesDir = path.resolve(process.cwd(), 'storage', 'quotes');
  fs.mkdirSync(quotesDir, { recursive: true });

  const htmlFilename = `quote_${ref}_${Date.now()}.html`;
  const pdfFilename = `PolarGuard_Official_Quote_${ref}.pdf`;
  const htmlPath = path.join(quotesDir, htmlFilename);
  const pdfPath = path.join(quotesDir, pdfFilename);

  const htmlContent = buildQuoteHTML(data);
  fs.writeFileSync(htmlPath, htmlContent, 'utf-8');

  const userDataDir = path.join(os.tmpdir(), 'pg_headless_pdf_profile');
  fs.mkdirSync(userDataDir, { recursive: true });

  try {
    console.log(`[pdfService] Generating quote PDF for #${ref} using ${path.basename(browser)}...`);
    const cmd = `"${browser}" --headless --no-sandbox --disable-gpu --no-pdf-header-footer --user-data-dir="${userDataDir}" --print-to-pdf="${pdfPath}" "${htmlPath}"`;
    execSync(cmd, { stdio: 'pipe', timeout: 20000 });

    if (fs.existsSync(pdfPath) && fs.statSync(pdfPath).size > 0) {
      console.log(`[pdfService] ✅ Quote PDF successfully generated: ${pdfPath} (${fs.statSync(pdfPath).size} bytes)`);
      // Clean up temp HTML file
      try { fs.unlinkSync(htmlPath); } catch {}
      return pdfPath;
    } else {
      console.error('[pdfService] ❌ PDF generation command finished but file was not created or is empty');
      return null;
    }
  } catch (err) {
    console.error('[pdfService] ❌ Error generating quote PDF:', (err as Error).message);
    return null;
  }
}

// ═════════════════════════════════════════════════════════════════════
// 2-PAGE OFFICIAL TD PINK CARD GENERATOR
// ═════════════════════════════════════════════════════════════════════

export interface PinkCardPDFData {
  policyNumber: string;
  customerName: string;
  additionalDrivers?: string;
  street?: string;
  city?: string;
  postal?: string;
  province?: string;
  vehicle: string;
  vin: string;
  effectiveDate?: Date | string;
  term?: string; // '1m' | '3m' | '6m' | '12m'
}

function getPinkCardBackgroundBase64(): string {
  const candidates = [
    path.resolve(process.cwd(), 'assets', 'pink-crests-background.png'),
    path.resolve(process.cwd(), 'server', 'assets', 'pink-crests-background.png'),
    path.resolve(__dirname, '..', '..', 'assets', 'pink-crests-background.png'),
    path.resolve(__dirname, '..', '..', '..', 'app', 'public', 'images', 'pink-crests-background.png'),
    'C:\\Users\\hp\\OneDrive - Université Privée de Marrakech\\Desktop\\Badasscheater\\server\\assets\\pink-crests-background.png',
    'C:\\Users\\hp\\OneDrive - Université Privée de Marrakech\\Desktop\\Badasscheater\\app\\public\\images\\pink-crests-background.png',
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      try {
        const buf = fs.readFileSync(c);
        return `data:image/png;base64,${buf.toString('base64')}`;
      } catch {}
    }
  }
  return '';
}

function deriveAddressFromPostal(postal?: string): { street: string; cityProvincePostal: string } {
  const p = (postal || '').trim().toUpperCase();
  const f = p.charAt(0);
  if (f === 'M') {
    return { street: '280 FRONT STREET WEST', cityProvincePostal: `TORONTO, ON ${p || 'M5V 2T6'}` };
  } else if (f === 'L' || f === 'K' || f === 'N' || f === 'P') {
    return { street: '142 MAIN STREET NORTH', cityProvincePostal: `MARKHAM, ON ${p || 'L3R 4H8'}` };
  } else if (f === 'T') {
    return { street: '11235 117 STREET NW', cityProvincePostal: `EDMONTON, AB ${p || 'T5G 2W3'}` };
  } else if (f === 'V') {
    return { street: '888 BURRARD STREET', cityProvincePostal: `VANCOUVER, BC ${p || 'V6Z 1X9'}` };
  } else if (f === 'R') {
    return { street: '360 MAIN STREET', cityProvincePostal: `WINNIPEG, MB ${p || 'R3C 3Z3'}` };
  } else if (f === 'E') {
    return { street: '77 KING STREET', cityProvincePostal: `MONCTON, NB ${p || 'E1C 1G8'}` };
  } else if (f === 'B') {
    return { street: '1800 ARGYLE STREET', cityProvincePostal: `HALIFAX, NS ${p || 'B3J 3N8'}` };
  } else {
    return { street: '100 KING STREET WEST', cityProvincePostal: `TORONTO, ON ${p || 'M5X 1A9'}` };
  }
}

/**
 * Builds the HTML template for the official Canadian 2-Page TD Pink Card.
 * Page 1: Front of the card with policy, driver, agency, insurer, dates & vehicle details.
 * Page 2: Back of the card with Canadian statutory warning & bilingual conditions.
 */
export function buildPinkCardHTML(data: PinkCardPDFData): string {
  const eff = data.effectiveDate ? new Date(data.effectiveDate) : new Date();
  const effYear = eff.getFullYear().toString();
  const effMonth = String(eff.getMonth() + 1).padStart(2, '0');
  const effDay = String(eff.getDate()).padStart(2, '0');

  const exp = new Date(eff);
  const t = (data.term || '12m').toLowerCase();
  if (t === '1m') {
    exp.setMonth(exp.getMonth() + 1);
  } else if (t === '3m') {
    exp.setMonth(exp.getMonth() + 3);
  } else if (t === '6m') {
    exp.setMonth(exp.getMonth() + 6);
  } else {
    exp.setFullYear(exp.getFullYear() + 1);
  }
  const expYear = exp.getFullYear().toString();
  const expMonth = String(exp.getMonth() + 1).padStart(2, '0');
  const expDay = String(exp.getDate()).padStart(2, '0');

  const primaryName = (data.customerName || 'VALUED CUSTOMER').trim().toUpperCase();
  const addDrivers = data.additionalDrivers && !/just\s*me|none|no/i.test(data.additionalDrivers)
    ? ` & ${data.additionalDrivers.trim().toUpperCase()}`
    : '';
  const insuredName = `${primaryName}${addDrivers}`;

  const postal = (data.postal || 'M5V 2T6').trim().toUpperCase();
  const addrInfo = deriveAddressFromPostal(postal);
  const insuredStreet = (data.street && data.street.trim() ? data.street.trim() : addrInfo.street).toUpperCase();
  const rawCity = data.city && data.city.trim() ? data.city.trim() : (addrInfo.cityProvincePostal.split(',')[0] || 'TORONTO');
  const rawProv = data.province || (addrInfo.cityProvincePostal.split(',')[1]?.trim().split(' ')[0]) || 'ON';
  const insuredCity = `${rawCity.toUpperCase()}, ${rawProv.toUpperCase()} ${postal}`.toUpperCase();

  const vehicleInfo = (data.vehicle || '2021 HONDA CR-V').toUpperCase();
  const vin = (data.vin || '').toUpperCase();
  const bgBase64 = getPinkCardBackgroundBase64();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>PolarGuard Official Pink Card #${data.policyNumber}</title>
<style>
  @page { size: 600px 376px; margin: 0; }
  html, body { width: 600px; height: 752px; margin: 0; padding: 0; background: #ffffff; font-family: 'Times New Roman', Times, serif; color: #1a1a1a; overflow: hidden; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  
  .page { width: 600px; height: 376px; position: relative; overflow: hidden; page-break-after: always; box-sizing: border-box; }
  .bg-image { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
  .content-layer { position: absolute; inset: 0; z-index: 1; display: flex; flex-direction: column; height: 100%; }

  /* PAGE 1: FRONT CARD */
  .header-box { padding: 10px 14px 10px 20px; border-bottom: 1px solid #333; color: #1a1a1a; flex-shrink: 0; }
  .header-title { font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.3px; }
  .header-address { font-size: 10px; margin-top: 2px; }
  .flex-section { display: flex; flex-shrink: 0; border-bottom: 1px solid #333; background: rgba(255,255,255,0.15); }
  .side-label { width: 24px; border-right: 1px solid #333; background: rgba(255,255,255,0.35); position: relative; overflow: hidden; flex-shrink: 0; }
  .section-body { padding: 8px 14px 8px 20px; flex: 1; }
  .body-title { font-size: 12.5px; font-weight: bold; color: #1a1a1a; margin-bottom: 2px; text-transform: uppercase; }
  .body-line { font-size: 10.5px; color: #1a1a1a; line-height: 1.3; text-transform: uppercase; }
  table.policy-tbl { width: 100%; border-collapse: collapse; flex-shrink: 0; }
  table.policy-tbl th, table.policy-tbl td { border: 1px solid #333; padding: 4px 2px; font-size: 9.5px; font-weight: bold; text-align: center; vertical-align: middle; color: #1a1a1a; }
  table.policy-tbl th { padding: 2px 2px; font-size: 7.5px; text-transform: uppercase; font-weight: bold; line-height: 1.0; background: rgba(255,255,255,0.25); height: 24px; vertical-align: top; }
  .th-left { padding: 2px 2px 2px 8px !important; text-align: left !important; }
  .td-left { padding: 4px 2px 4px 8px !important; text-align: left !important; }
  .vehicle-row { display: flex; align-items: center; justify-content: space-between; flex: 1; padding: 8px 14px 8px 20px; background: rgba(255,255,255,0.1); border-top: 1px solid #333; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #1a1a1a; }

  /* PAGE 2: BACK (TERMS & CONDITIONS WITH PINK BACKGROUND) */
  .terms-layer { position: absolute; inset: 0; z-index: 1; padding: 18px 22px; display: flex; flex-direction: column; justify-content: space-between; font-family: Arial, Helvetica, sans-serif; color: #1a1a1a; box-sizing: border-box; }
  .terms-header { font-weight: bold; font-size: 10px; color: #1a1a1a; margin-bottom: 3px; text-align: left; }
  .terms-text { font-size: 9px; line-height: 1.3; text-align: justify; color: #1a1a1a; }
  .terms-warning { margin-top: 5px; margin-bottom: 5px; font-size: 9px; }
  .warning-title { font-weight: bold; color: #1a1a1a; text-decoration: underline; }
  .fr-section { margin-top: 6px; border-top: 1px solid rgba(0,0,0,0.3); padding-top: 6px; }
</style>
</head>
<body>

<!-- PAGE 1: FRONT OF PINK CARD -->
<div class="page">
  ${bgBase64 ? `<img src="${bgBase64}" class="bg-image" alt="">` : ''}
  <div class="content-layer">
    <div class="header-box">
      <div class="header-title">INSURER / ASSUREUR: <span style="font-weight: normal;">TD General Insurance Company</span></div>
      <div class="header-address">66 Wellington St W., 39th FL Toronto, ON M5K 1A2</div>
    </div>
    <div class="flex-section">
      <div class="side-label">
        <svg style="position: absolute; inset: 0; width: 100%; height: 100%;">
          <g transform="translate(12, 22) rotate(90)">
            <text text-anchor="middle" fill="#1a1a1a" font-size="7.5" font-weight="bold" font-family="Times New Roman, serif" letter-spacing="0.3">AGENCY</text>
            <text y="8" text-anchor="middle" fill="#1a1a1a" font-size="6.5" font-weight="bold" font-family="Times New Roman, serif" opacity="0.8">AGENCE</text>
          </g>
        </svg>
      </div>
      <div class="section-body">
        <div class="body-title">TD INSURANCE DIRECT AGENCY INC.</div>
        <div class="body-line">101 MCNABB STREET, 2ND FLOOR, MARKHAM, ON L3R 4H8</div>
      </div>
    </div>
    <div class="flex-section">
      <div class="side-label">
        <svg style="position: absolute; inset: 0; width: 100%; height: 100%;">
          <g transform="translate(12, 30) rotate(90)">
            <text text-anchor="middle" fill="#1a1a1a" font-size="7.5" font-weight="bold" font-family="Times New Roman, serif" letter-spacing="0.3">INSURED</text>
            <text y="8" text-anchor="middle" fill="#1a1a1a" font-size="6.5" font-weight="bold" font-family="Times New Roman, serif" opacity="0.8">ASSUR&Eacute;-E</text>
          </g>
        </svg>
      </div>
      <div class="section-body">
        <div class="body-title">${insuredName}</div>
        <div class="body-line">${insuredStreet}</div>
        <div class="body-line">${insuredCity}</div>
      </div>
    </div>
    <table class="policy-tbl">
      <thead>
        <tr>
          <th class="th-left" style="width: 20%;"><div>POLICY NO</div><div style="font-size: 5.8px; font-weight: normal; margin-top: 1px; opacity: 0.85;">NO DE POLICE</div></th>
          <th style="width: 8%;">Y/A</th><th style="width: 7%;">M</th><th style="width: 7%;">D/J</th>
          <th class="th-left" style="width: 16%;"><div>EFFECTIVE DATE</div><div style="font-size: 5.8px; font-weight: normal; margin-top: 1px; opacity: 0.85;">DATE D'EFFET</div></th>
          <th class="th-left" style="width: 16%;"><div>EXPIRY DATE</div><div style="font-size: 5.8px; font-weight: normal; margin-top: 1px; opacity: 0.85;">EXPIRATION</div></th>
          <th style="width: 8%;">Y/A</th><th style="width: 7%;">M</th><th style="width: 7%;">D/J</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="td-left">${data.policyNumber}</td>
          <td>${effYear}</td><td>${effMonth}</td><td>${effDay}</td>
          <td class="td-left">${effYear} &nbsp;&nbsp; ${effMonth} &nbsp;&nbsp; ${effDay}</td>
          <td class="td-left">${expYear} &nbsp;&nbsp; ${expMonth} &nbsp;&nbsp; ${expDay}</td>
          <td>${expYear}</td><td>${expMonth}</td><td>${expDay}</td>
        </tr>
      </tbody>
    </table>
    <div class="vehicle-row">
      <span>${vehicleInfo}</span>
      <span style="font-family: monospace; letter-spacing: 0.5px; font-size: 10px;">VIN: ${vin}</span>
    </div>
  </div>
</div>

<!-- PAGE 2: BACK OF PINK CARD (TERMS & CONDITIONS WITH PINK BACKGROUND) -->
<div class="page">
  ${bgBase64 ? `<img src="${bgBase64}" class="bg-image" alt="">` : ''}
  <div class="terms-layer">
    <div>
      <div class="terms-header">This certificate is subject to the terms and conditions of the insurer's standard automobile policy.</div>
      <div class="terms-text">This certifies that the party named herein is insured against liability for bodily injury and property damage by reason of the operation of the motor vehicle described herein, in an amount not less than the statutory minimum requirements in any area of Canada.</div>
      <div class="terms-warning">
        <span class="warning-title">WARNING</span> - Any person who issues or produces a card to show that there is in force a policy of insurance as indicated herein that is in fact not in force is liable to a heavy fine and/or imprisonment and his licence may be suspended.
      </div>
      <div class="terms-text">This card should be carried in the insured vehicle for production as proof of insurance when demanded by police.</div>
    </div>
    
    <div class="fr-section">
      <div class="terms-header" style="font-style: italic;">Le présent certificat est assujetti aux dispositions et conditions de la police d'assurance automobile de l'Assureur.</div>
      <div class="terms-text">Ce certificat atteste que la personne susnommée est assurée contre la responsabilité pour blessures et dommages aux biens découlant de l'usage du véhicule ci-décrit, conformément aux limites minimales exigées par les lois d'assurance en vigueur partout au Canada.</div>
      <div class="terms-warning">
        <span class="warning-title">AVERTISSEMENT</span> - Quiconque émet ou présente un tel certificat comme preuve d'une police d'assurance-responsabilité qui effectivement n'est pas en vigueur, est coupable d'une infraction passible d'une forte amende et/ou d'emprisonnement et suspension de son permis.
      </div>
      <div class="terms-text">Ce certificat doit être laissé dans le véhicule assuré afin d'être présenté comme preuve d'assurance lorsque la police l'exige.</div>
    </div>
  </div>
</div>

</body>
</html>
`;
}

/**
 * Generates an official 2-page Canadian TD Pink Card PDF customized with the customer's policy details.
 */
export async function generatePinkCardPDF(data: PinkCardPDFData): Promise<string | null> {
  const browser = getBrowserPath();
  if (!browser) {
    console.warn('[pdfService] No browser binary found for headless PDF generation.');
    return null;
  }

  const cardsDir = path.resolve(process.cwd(), 'storage', 'pink_cards');
  fs.mkdirSync(cardsDir, { recursive: true });

  const safeName = (data.customerName || 'Customer').replace(/[^a-zA-Z0-9]/g, '_');
  const htmlFilename = `pink_card_${data.policyNumber}_${Date.now()}.html`;
  const pdfFilename = `PolarGuard_Pink_Card_${safeName}_2Page.pdf`;
  const htmlPath = path.join(cardsDir, htmlFilename);
  const pdfPath = path.join(cardsDir, pdfFilename);

  const htmlContent = buildPinkCardHTML(data);
  fs.writeFileSync(htmlPath, htmlContent, 'utf-8');

  const userDataDir = path.join(os.tmpdir(), 'pg_headless_pink_card_profile');
  fs.mkdirSync(userDataDir, { recursive: true });

  try {
    console.log(`[pdfService] Generating official 2-Page Pink Card PDF for #${data.policyNumber} (${data.customerName})...`);
    const cmd = `"${browser}" --headless --no-sandbox --disable-gpu --no-pdf-header-footer --user-data-dir="${userDataDir}" --print-to-pdf="${pdfPath}" "${htmlPath}"`;
    execSync(cmd, { stdio: 'pipe', timeout: 20000 });

    if (fs.existsSync(pdfPath) && fs.statSync(pdfPath).size > 0) {
      console.log(`[pdfService] ✅ 2-Page Pink Card PDF successfully generated: ${pdfPath} (${fs.statSync(pdfPath).size} bytes)`);
      try { fs.unlinkSync(htmlPath); } catch {}
      return pdfPath;
    } else {
      console.error('[pdfService] ❌ Pink Card PDF generation finished but file was not created');
      return null;
    }
  } catch (err) {
    console.error('[pdfService] ❌ Error generating Pink Card PDF:', (err as Error).message);
    return null;
  }
}

