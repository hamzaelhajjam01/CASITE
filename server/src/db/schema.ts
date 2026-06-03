import { getDB } from './client.js';

/**
 * Creates MongoDB indexes for all collections.
 * Safe to run repeatedly — createIndex is idempotent.
 */
export async function createIndexes(): Promise<void> {
  const db = getDB();

  // packages — unique slug for fast lookup
  await db.collection('packages').createIndex({ slug: 1 }, { unique: true });
  await db.collection('packages').createIndex({ is_active: 1 });

  // pricing_rules — unique rule_key
  await db.collection('pricing_rules').createIndex({ rule_key: 1 }, { unique: true });
  await db.collection('pricing_rules').createIndex({ context: 1, is_active: 1 });

  // coverage_rows — ordered by sort_order
  await db.collection('coverage_rows').createIndex({ sort_order: 1 });
  await db.collection('coverage_rows').createIndex({ is_active: 1 });

  console.log('✓ MongoDB indexes created');
}
