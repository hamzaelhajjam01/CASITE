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
  applied_rules: { label: string; multiplier: number }[];
  term_label: string;
  package_name: string;
}

export interface SiteSettings {
  company_name: string;
  etransfer_email: string;
}

export interface PaymentNotifyPayload {
  policy_number:  string;
  amount:         number;
  coverage_type:  string;
  term:           string;
  deductible:     string;
  vin:            string;
  vehicle:        string;
  license_class:  string;
  dob:            string;
  postal:         string;
  receipt_base64: string;
  receipt_name:   string;
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
