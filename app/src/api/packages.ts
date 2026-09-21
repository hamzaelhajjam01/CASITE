const BASE = import.meta.env.VITE_API_URL ?? '/api';

export interface PackageData {
  id: string;
  slug: string;
  name: string;
  description: string;
  is_active: boolean;
  prices: Record<string, number>; // { '1m': 226, '3m': 481, ... }
  coverage_rows?: CoverageRowData[];
}

export interface CoverageRowData {
  id: string;
  sort_order: number;
  name: string;
  description: string;
  basic_value: string;
  full_value: string;
  is_active: boolean;
}

export interface QuoteResult {
  base_price: number;
  final_price: number;
  monthly_price?: number;
  applied_rules: { label: string; multiplier: number }[];
  term_label: string;
  package_name: string;
}

export interface SiteSettings {
  company_name: string;
  etransfer_email: string;
}

export interface PaymentNotifyPayload {
  policy_number:      string;
  amount:             number;
  coverage_type:      string;
  term:               string;
  deductible:         string;
  vin:                string;
  vehicle:            string;
  license_class:      string;
  dob:                string;
  postal:             string;
  street?:            string;
  city?:              string;
  province?:          string;
  receipt_base64:     string;
  receipt_name:       string;
  customer_name?:     string;
  customer_email?:    string;
  customer_phone?:    string;
  additional_drivers?: string;
  billing_frequency?: 'full' | 'monthly';
}

export async function notifyPayment(payload: PaymentNotifyPayload): Promise<void> {
  await fetch(`${BASE}/notify/payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  // Fire-and-forget — don't throw, never block the user flow
}

export async function checkPolicyStatus(policyNumber: string): Promise<{ status: 'pending' | 'active' | 'rejected' }> {
  const res = await fetch(`${BASE}/notify/status/${policyNumber}`);
  if (!res.ok) return { status: 'pending' };
  return res.json();
}

export async function fetchSettings(): Promise<SiteSettings> {
  const res = await fetch(`${BASE}/settings`);
  if (!res.ok) throw new Error('Failed to load settings');
  return res.json();
}

export async function fetchPackages(): Promise<PackageData[]> {
  const res = await fetch(`${BASE}/packages`);
  if (!res.ok) throw new Error('Failed to load packages');
  return res.json();
}

export async function calculateQuote(payload: {
  term: string;
  package_slug: string;
  deductible: string;
  license_class: string;
  date_of_birth: string;
  extra_vehicle_count: number;
  extra_driver_count?: number;
}): Promise<QuoteResult> {
  const res = await fetch(`${BASE}/quote/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || 'Quote calculation failed');
  }
  return res.json();
}

export interface QuoteSubmitPayload {
  policy_number: string;
  ref_num?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  license_class?: string;
  dob?: string;
  postal?: string;
  province?: string;
  street?: string;
  city?: string;
  vehicle: string;
  vin: string;
  extra_vehicles?: string[];
  coverage_type: 'basic' | 'full';
  term: '1m' | '3m' | '6m' | '12m';
  term_label?: string;
  deductible: '500' | '1000';
  billing_frequency: 'full' | 'monthly';
  due_today: number;
  total_price: number;
  monthly_price: number;
  additional_drivers?: string;
}

export async function submitQuote(payload: QuoteSubmitPayload): Promise<{ ok: boolean; email_sent: boolean; policy_number: string; ref_num: string }> {
  const res = await fetch(`${BASE}/quote/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || 'Quote submission failed');
  }
  return res.json();
}

