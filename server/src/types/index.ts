import type { ObjectId } from 'mongodb';

// ─── MongoDB document shapes ──────────────────────────────────────

export interface PackageDoc {
  _id?: ObjectId;
  slug: string;          // 'basic' | 'full'
  name: string;
  description: string;
  is_active: boolean;
  prices: Record<string, number>; // { '1m': 226, '3m': 481, ... } — dollars
  created_at: Date;
  updated_at: Date;
}

export interface PricingRuleDoc {
  _id?: ObjectId;
  rule_key: string;      // unique, e.g. 'deductible_1000'
  label: string;
  rule_type: 'multiplier' | 'term_discount';
  context: 'deductible' | 'license' | 'age' | 'multi_vehicle' | 'term';
  match_value: string | null;
  multiplier: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CoverageRowDoc {
  _id?: ObjectId;
  sort_order: number;
  name: string;
  description: string;
  basic_value: string;
  full_value: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// ─── API response shapes ──────────────────────────────────────────

export interface PackageResponse {
  id: string;
  slug: string;
  name: string;
  description: string;
  is_active: boolean;
  prices: Record<string, number>;
  coverage_rows?: CoverageRowResponse[];
}

export interface CoverageRowResponse {
  id: string;
  sort_order: number;
  name: string;
  description: string;
  basic_value: string;
  full_value: string;
  is_active: boolean;
}

export interface PricingRuleResponse {
  id: string;
  rule_key: string;
  label: string;
  rule_type: 'multiplier' | 'term_discount';
  context: string;
  match_value: string | null;
  multiplier: number;
  is_active: boolean;
}

export interface QuoteRequest {
  term: '1m' | '3m' | '6m' | '12m';
  package_slug: 'basic' | 'full';
  deductible: '500' | '1000';
  license_class: 'G' | 'G2' | 'G1';
  date_of_birth: string; // YYYY-MM-DD
  extra_vehicle_count: number;
}

export interface QuoteResponse {
  base_price: number;
  final_price: number;
  applied_rules: { label: string; multiplier: number }[];
  term_label: string;
  package_name: string;
}

// ─── JWT payload ──────────────────────────────────────────────────

export interface AdminTokenPayload {
  sub: string;
  iat: number;
  exp: number;
}
