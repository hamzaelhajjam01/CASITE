import { Router } from 'express';
import { z } from 'zod';
import { getDB } from '../db/client.js';
import { validate } from '../middleware/validate.js';
import type { PackageDoc, PricingRuleDoc, QuoteResponse, PolicyDoc } from '../types/index.js';

const router = Router();

const quoteSchema = z.object({
  term:                z.enum(['1m', '3m', '6m', '12m']),
  package_slug:        z.enum(['basic', 'full']),
  deductible:          z.enum(['500', '1000']),
  license_class:       z.enum(['G', 'G2', 'G1']),
  date_of_birth:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'),
  extra_vehicle_count: z.number().int().min(0).max(9),
  extra_driver_count:  z.number().int().min(0).max(2).optional().default(0),
});

const termLabels: Record<string, string> = {
  '1m': '1 month prepaid', '3m': '3 months prepaid',
  '6m': '6 months prepaid', '12m': '12 months prepaid',
};

const DRIVER_RATE_TABLE: Record<string, { monthly: number; months: number }> = {
  '1m':  { monthly: 40, months: 1 },
  '3m':  { monthly: 40, months: 3 },
  '6m':  { monthly: 15, months: 6 },
  '12m': { monthly: 10, months: 12 },
};

function calcAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

const OFFICIAL_PRICES: Record<string, { basic: number; full: number }> = {
  '3m':  { basic: 570,  full: 720 },
  '6m':  { basic: 1080, full: 1350 },
  '12m': { basic: 2040, full: 2520 },
};

const DEDUCTIBLE_ADDON: Record<string, number> = {
  '1m': 30,
  '3m': 50,
  '6m': 80,
  '12m': 140,
};

/**
 * POST /api/quote/calculate
 * Standardized calculation using the official PolarGuard term pricing matrix.
 */
router.post('/quote/calculate', validate(quoteSchema), async (req, res) => {
  const { term, package_slug, deductible, extra_vehicle_count, extra_driver_count } =
    req.body as z.infer<typeof quoteSchema>;

  const db = getDB();

  // 1. Resolve package from DB or fallback
  const pkg = await db.collection<PackageDoc>('packages').findOne({ slug: package_slug, is_active: true }).catch(() => null);
  const basePrice = pkg?.prices[term] ?? OFFICIAL_PRICES[term]?.[package_slug] ?? (package_slug === 'basic' ? 570 : 720);

  let price = basePrice;
  const applied: { label: string; multiplier: number }[] = [];

  // 2. Deductible option for Full Coverage ($500 lower out-of-pocket vs $1,000 standard)
  if (package_slug === 'full') {
    if (deductible === '500') {
      const addon = DEDUCTIBLE_ADDON[term] ?? 80;
      price += addon;
      applied.push({ label: `$500 Deductible Option (+$${addon} CAD)`, multiplier: 1 });
    } else {
      applied.push({ label: '$1,000 Deductible (Standard, Best Rate)', multiplier: 1 });
    }
  }

  // 3. Multi-vehicle: flat 20% off combined premium for 2 or more vehicles
  const totalVehicles = 1 + (extra_vehicle_count ?? 0);
  if (totalVehicles >= 2) {
    const combined = price * totalVehicles;
    price = Math.round(combined * 0.80);
    applied.push({ label: 'Multi-Vehicle Discount (Save 20%)', multiplier: 0.80 });
  }

  // 4. Additional drivers: $0 additional fee (Included Free)
  const driverCount = extra_driver_count ?? 0;
  if (driverCount > 0) {
    applied.push({ label: `+${driverCount} Additional Driver(s) (Included Free)`, multiplier: 1 });
  }

  const termMonths = term === '1m' ? 1 : term === '3m' ? 3 : term === '6m' ? 6 : 12;
  const monthlyPrice = Math.round(price / termMonths);

  const response: QuoteResponse = {
    base_price:    basePrice,
    final_price:   price,
    monthly_price: monthlyPrice,
    applied_rules: applied,
    term_label:    termLabels[term] ?? term,
    package_name:  pkg?.name ?? (package_slug === 'basic' ? 'Basic' : 'Full'),
  };

  res.json(response);
});

const quoteSubmitSchema = z.object({
  policy_number:      z.string(),
  ref_num:            z.string().optional(),
  customer_name:      z.string().min(1, 'Name is required'),
  customer_email:     z.string().email('Valid email required'),
  customer_phone:     z.string().optional(),
  license_class:      z.string().optional().default('G'),
  dob:                z.string().optional().default(''),
  postal:             z.string().optional().default(''),
  province:           z.string().optional(),
  street:             z.string().optional().default(''),
  city:               z.string().optional().default(''),
  vehicle:            z.string(),
  vin:                z.string(),
  extra_vehicles:     z.array(z.string()).optional(),
  coverage_type:      z.enum(['basic', 'full']),
  term:               z.enum(['1m', '3m', '6m', '12m']),
  term_label:         z.string().optional(),
  deductible:         z.enum(['500', '1000']).optional().default('1000'),
  billing_frequency:  z.enum(['full', 'monthly']).optional().default('full'),
  due_today:          z.number(),
  total_price:        z.number(),
  monthly_price:      z.number(),
  additional_drivers: z.string().optional(),
});

/**
 * POST /api/quote/submit
 * Final step submission: stores quote, fires automated Hostinger email to customer,
 * and notifies the broker on Telegram.
 */
router.post('/quote/submit', validate(quoteSubmitSchema), async (req, res, next) => {
  try {
    const d = req.body as z.infer<typeof quoteSubmitSchema>;

    // 1. Save quote to database
    try {
      const db = getDB();
      await db.collection<PolicyDoc>('policies').updateOne(
        { policy_number: d.policy_number },
        {
          $set: {
            policy_number: d.policy_number,
            ref_num: d.ref_num || d.policy_number,
            status: 'quote_submitted',
            amount: d.due_today,
            due_today: d.due_today,
            total_price: d.total_price,
            monthly_price: d.monthly_price,
            coverage_type: d.coverage_type,
            term: d.term,
            deductible: d.deductible,
            customer_name: d.customer_name,
            customer_email: d.customer_email,
            customer_phone: d.customer_phone,
            additional_drivers: d.additional_drivers,
            billing_frequency: d.billing_frequency,
            vin: d.vin,
            vehicle: d.vehicle,
            license_class: d.license_class,
            dob: d.dob,
            postal: d.postal,
            street: d.street,
            city: d.city,
            province: d.province,
            updated_at: new Date(),
          },
          $setOnInsert: { created_at: new Date() },
        },
        { upsert: true }
      );
    } catch (dbErr) {
      console.error('[quote/submit] MongoDB save error:', (dbErr as Error).message);
    }

    // 2. Generate customized official Quote PDF
    let pdfPath: string | null = null;
    try {
      const { generateQuotePDF } = await import('../services/pdfService.js');
      pdfPath = await generateQuotePDF({
        policyNumber: d.policy_number,
        refNum: d.ref_num || d.policy_number,
        customerName: d.customer_name,
        customerEmail: d.customer_email,
        customerPhone: d.customer_phone,
        licenseClass: d.license_class,
        dob: d.dob,
        postal: d.postal,
        province: d.province,
        vehicle: d.vehicle,
        vin: d.vin,
        extraVehicles: d.extra_vehicles,
        coverageType: d.coverage_type,
        term: d.term,
        termLabel: d.term_label || termLabels[d.term] || d.term,
        deductible: d.deductible,
        billingFrequency: d.billing_frequency,
        dueToday: d.due_today,
        totalPrice: d.total_price,
        monthlyPrice: d.monthly_price,
        additionalDrivers: d.additional_drivers,
      });

      if (pdfPath) {
        try {
          const db = getDB();
          await db.collection<PolicyDoc>('policies').updateOne(
            { policy_number: d.policy_number },
            { $set: { quote_pdf_path: pdfPath } }
          );
        } catch {}
      }
    } catch (pdfErr) {
      console.error('[quote/submit] PDF generation error:', (pdfErr as Error).message);
    }

    // 3. Dispatch automated email with attached quote PDF to customer
    let emailSent = false;
    try {
      const { sendQuoteSummaryEmail } = await import('../services/emailService.js');
      emailSent = await sendQuoteSummaryEmail({
        toEmail: d.customer_email,
        customerName: d.customer_name,
        policyNumber: d.policy_number,
        refNum: d.ref_num || d.policy_number,
        vehicle: d.vehicle,
        vin: d.vin,
        extraVehicles: d.extra_vehicles,
        coverageType: d.coverage_type,
        deductible: d.deductible,
        term: d.term,
        termLabel: d.term_label || termLabels[d.term] || d.term,
        billingFrequency: d.billing_frequency,
        dueToday: d.due_today,
        totalPrice: d.total_price,
        monthlyPrice: d.monthly_price,
        additionalDrivers: d.additional_drivers,
        attachmentPath: pdfPath || undefined,
      });
    } catch (emailErr) {
      console.error('[quote/submit] Failed to send email:', (emailErr as Error).message);
    }

    // Note: Broker Telegram alert is purposely omitted here and only dispatched
    // once payment/receipt is uploaded in /api/notify/payment.

    res.json({
      ok: true,
      email_sent: emailSent,
      pdf_generated: Boolean(pdfPath),
      policy_number: d.policy_number,
      ref_num: d.ref_num || d.policy_number,
    });
  } catch (err) {
    next(err);
  }
});

export default router;

