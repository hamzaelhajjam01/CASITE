const BASE = import.meta.env.VITE_API_URL ?? '/api';

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('pg_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data as T;
}

// ─── Auth ─────────────────────────────────────────────────────────
export const login = (email: string, password: string) =>
  req<{ token: string; email: string }>('POST', '/auth/login', { email, password });

// ─── Packages ─────────────────────────────────────────────────────
export interface Package {
  id: string;
  slug: string;
  name: string;
  description: string;
  is_active: boolean;
  prices: Record<string, number>;
}

export const getPackages   = ()           => req<Package[]>('GET',    '/admin/packages');
export const createPackage = (b: unknown) => req<Package>('POST',   '/admin/packages', b);
export const updatePackage = (id: string, b: unknown) => req<Package>('PUT', `/admin/packages/${id}`, b);
export const deletePackage = (id: string) => req<{ message: string }>('DELETE', `/admin/packages/${id}`);

// ─── Pricing Rules ────────────────────────────────────────────────
export interface PricingRule {
  id: string;
  rule_key: string;
  label: string;
  rule_type: 'multiplier' | 'term_discount';
  context: string;
  match_value: string | null;
  multiplier: number;
  is_active: boolean;
}

export const getPricingRules   = ()                        => req<PricingRule[]>('GET',    '/admin/pricing-rules');
export const createPricingRule = (b: unknown)              => req<PricingRule>('POST',   '/admin/pricing-rules', b);
export const updatePricingRule = (id: string, b: unknown)  => req<PricingRule>('PUT',    `/admin/pricing-rules/${id}`, b);
export const deletePricingRule = (id: string)              => req<{ message: string }>('DELETE', `/admin/pricing-rules/${id}`);

// ─── Coverage Rows ────────────────────────────────────────────────
export interface CoverageRow {
  id: string;
  sort_order: number;
  name: string;
  description: string;
  basic_value: string;
  full_value: string;
  is_active: boolean;
}

export const getCoverageRows   = ()                        => req<CoverageRow[]>('GET',    '/admin/coverage-rows');
export const createCoverageRow = (b: unknown)              => req<CoverageRow>('POST',   '/admin/coverage-rows', b);
export const updateCoverageRow = (id: string, b: unknown)  => req<CoverageRow>('PUT',    `/admin/coverage-rows/${id}`, b);
export const deleteCoverageRow = (id: string)              => req<{ message: string }>('DELETE', `/admin/coverage-rows/${id}`);

// ─── Settings ─────────────────────────────────────────────────────
export interface SiteSettings {
  company_name: string;
  etransfer_email: string;
}

export const getSettings    = ()                   => req<SiteSettings>('GET', '/settings');
export const updateSettings = (b: SiteSettings)    => req<SiteSettings>('PUT', '/admin/settings', b);
