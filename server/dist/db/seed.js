/**
 * Seed script — inserts default insurance packages, pricing rules, and
 * coverage rows into MongoDB Atlas, mirroring the hardcoded constants
 * from VINQuoteSystem.tsx, CoveragePlans.tsx, and SavingsCalculator.tsx.
 *
 * Run:     npm run seed
 * Safe to re-run: uses updateOne with upsert so existing docs are updated.
 */
import 'dotenv/config';
import { connectDB, closeDB } from './client.js';
import { createIndexes } from './schema.js';
const db = await connectDB();
await createIndexes();
// ─── Packages ─────────────────────────────────────────────────────
const packages = [
    {
        slug: 'basic',
        name: 'Basic',
        description: 'Essential coverage with third-party liability and provincial minimums. Perfect for plate renewal and short-term needs.',
        is_active: true,
        prices: { '1m': 226, '3m': 481, '6m': 818, '12m': 1444 },
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        slug: 'full',
        name: 'Full',
        description: 'Comprehensive protection including collision, comprehensive, glass, and loss of use. Recommended for everyday drivers.',
        is_active: true,
        prices: { '1m': 339, '3m': 722, '6m': 1227, '12m': 2166 },
        created_at: new Date(),
        updated_at: new Date(),
    },
];
for (const pkg of packages) {
    const { created_at, ...rest } = pkg;
    await db.collection('packages').updateOne({ slug: pkg.slug }, { $set: rest, $setOnInsert: { created_at } }, { upsert: true });
}
console.log('✓ Packages seeded (2)');
// ─── Pricing Rules ────────────────────────────────────────────────
const rules = [
    { rule_key: 'deductible_1000', label: '$1,000 Deductible Discount', rule_type: 'multiplier', context: 'deductible', match_value: '1000', multiplier: 0.90, is_active: true, created_at: new Date(), updated_at: new Date() },
    { rule_key: 'license_G2', label: 'G2 License Surcharge', rule_type: 'multiplier', context: 'license', match_value: 'G2', multiplier: 1.05, is_active: true, created_at: new Date(), updated_at: new Date() },
    { rule_key: 'license_G1', label: 'G1 License Surcharge', rule_type: 'multiplier', context: 'license', match_value: 'G1', multiplier: 1.15, is_active: true, created_at: new Date(), updated_at: new Date() },
    { rule_key: 'age_under_25', label: 'Under 25 Surcharge', rule_type: 'multiplier', context: 'age', match_value: '<25', multiplier: 1.30, is_active: true, created_at: new Date(), updated_at: new Date() },
    { rule_key: 'age_under_30', label: 'Under 30 Surcharge', rule_type: 'multiplier', context: 'age', match_value: '<30', multiplier: 1.10, is_active: true, created_at: new Date(), updated_at: new Date() },
    { rule_key: 'age_65_plus', label: '65+ Surcharge', rule_type: 'multiplier', context: 'age', match_value: '>=65', multiplier: 1.05, is_active: true, created_at: new Date(), updated_at: new Date() },
    { rule_key: 'multi_vehicle', label: 'Multi-Vehicle Bulk Discount', rule_type: 'multiplier', context: 'multi_vehicle', match_value: null, multiplier: 0.80, is_active: true, created_at: new Date(), updated_at: new Date() },
    { rule_key: 'term_discount_6m', label: 'Prepaid 6-Month Discount', rule_type: 'term_discount', context: 'term', match_value: '6m', multiplier: 0.85, is_active: true, created_at: new Date(), updated_at: new Date() },
    { rule_key: 'term_discount_12m', label: 'Prepaid 12-Month Discount', rule_type: 'term_discount', context: 'term', match_value: '12m', multiplier: 0.75, is_active: true, created_at: new Date(), updated_at: new Date() },
];
for (const rule of rules) {
    const { created_at, ...rest } = rule;
    await db.collection('pricing_rules').updateOne({ rule_key: rule.rule_key }, { $set: rest, $setOnInsert: { created_at } }, { upsert: true });
}
console.log('✓ Pricing rules seeded (9)');
// ─── Coverage Rows ────────────────────────────────────────────────
const coverageRows = [
    { sort_order: 1, name: 'Third-Party Liability', description: 'Injury or property damage you cause to others', basic_value: '$1,000,000', full_value: '$2,000,000', is_active: true, created_at: new Date(), updated_at: new Date() },
    { sort_order: 2, name: 'Accident Benefits', description: 'Medical, rehab & income replacement', basic_value: 'Provincial minimums', full_value: 'Enhanced — up to $1M medical, $1,000/wk income', is_active: true, created_at: new Date(), updated_at: new Date() },
    { sort_order: 3, name: 'Direct Compensation – Property Damage', description: 'Damage to your car, not-at-fault', basic_value: 'Included · $0 deductible', full_value: 'Included · $0 deductible', is_active: true, created_at: new Date(), updated_at: new Date() },
    { sort_order: 4, name: 'Uninsured Automobile', description: 'Hit by an uninsured driver', basic_value: 'Up to $200,000', full_value: 'Up to $200,000', is_active: true, created_at: new Date(), updated_at: new Date() },
    { sort_order: 5, name: 'Collision', description: 'At-fault damage to your vehicle', basic_value: 'Not included', full_value: '$500 or $1,000 deductible', is_active: true, created_at: new Date(), updated_at: new Date() },
    { sort_order: 6, name: 'Comprehensive', description: 'Theft, fire, vandalism, hail, animal strike', basic_value: 'Not included', full_value: '$500 or $1,000 deductible', is_active: true, created_at: new Date(), updated_at: new Date() },
    { sort_order: 7, name: 'Glass / Windshield', description: 'Cracks, chips, full replacement', basic_value: 'Not included', full_value: 'Included under comprehensive', is_active: true, created_at: new Date(), updated_at: new Date() },
    { sort_order: 8, name: 'Loss of Use', description: 'Rental car after a covered claim', basic_value: 'Not included', full_value: 'Up to $900 / 30 days', is_active: true, created_at: new Date(), updated_at: new Date() },
];
for (const row of coverageRows) {
    const { created_at, ...rest } = row;
    await db.collection('coverage_rows').updateOne({ sort_order: row.sort_order, name: row.name }, { $set: rest, $setOnInsert: { created_at } }, { upsert: true });
}
console.log('✓ Coverage rows seeded (8)');
await closeDB();
console.log('\n✅ Seed complete — MongoDB Atlas ready');
