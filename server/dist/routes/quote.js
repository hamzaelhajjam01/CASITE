import { Router } from 'express';
import { z } from 'zod';
import { getDB } from '../db/client.js';
import { validate } from '../middleware/validate.js';
const router = Router();
const quoteSchema = z.object({
    term: z.enum(['1m', '3m', '6m', '12m']),
    package_slug: z.enum(['basic', 'full']),
    deductible: z.enum(['500', '1000']),
    license_class: z.enum(['G', 'G2', 'G1']),
    date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'),
    extra_vehicle_count: z.number().int().min(0).max(9),
});
const termLabels = {
    '1m': '1 month prepaid', '3m': '3 months prepaid',
    '6m': '6 months prepaid', '12m': '12 months prepaid',
};
function calcAge(dob) {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate()))
        age--;
    return age;
}
/**
 * POST /api/quote/calculate
 * DB-driven port of calculatePrice() from VINQuoteSystem.tsx.
 */
router.post('/quote/calculate', validate(quoteSchema), async (req, res) => {
    const { term, package_slug, deductible, license_class, date_of_birth, extra_vehicle_count } = req.body;
    const db = getDB();
    // 1. Resolve package
    const pkg = await db.collection('packages').findOne({ slug: package_slug, is_active: true });
    if (!pkg) {
        res.status(404).json({ error: `Package "${package_slug}" not found or inactive` });
        return;
    }
    // 2. Base price from embedded prices map (stored in dollars)
    const basePrice = pkg.prices[term];
    if (basePrice === undefined) {
        res.status(404).json({ error: `No price for ${package_slug}/${term}` });
        return;
    }
    let price = basePrice;
    const applied = [];
    const age = calcAge(date_of_birth);
    // 3. Load active pricing rules
    const allRules = await db
        .collection('pricing_rules')
        .find({ is_active: true })
        .sort({ _id: 1 })
        .toArray();
    const regularRules = allRules.filter((r) => r.rule_type !== 'term_discount');
    const termDiscounts = allRules.filter((r) => r.rule_type === 'term_discount');
    // 4a. Deductible
    for (const rule of regularRules.filter((r) => r.context === 'deductible')) {
        if (rule.match_value === deductible) {
            price = Math.round(price * rule.multiplier * 100) / 100;
            applied.push({ label: rule.label, multiplier: rule.multiplier });
        }
    }
    // 4b. License class
    for (const rule of regularRules.filter((r) => r.context === 'license')) {
        if (rule.match_value === license_class) {
            price = Math.round(price * rule.multiplier * 100) / 100;
            applied.push({ label: rule.label, multiplier: rule.multiplier });
        }
    }
    // 4c. Age — only first matching bracket fires
    const ageRules = regularRules.filter((r) => r.context === 'age');
    let ageFired = false;
    for (const mv of ['<25', '<30', '>=65']) {
        if (ageFired)
            break;
        const rule = ageRules.find((r) => r.match_value === mv);
        if (!rule)
            continue;
        const matches = (mv === '<25' && age < 25) ||
            (mv === '<30' && age >= 25 && age < 30) ||
            (mv === '>=65' && age >= 65);
        if (matches) {
            price = Math.round(price * rule.multiplier * 100) / 100;
            applied.push({ label: rule.label, multiplier: rule.multiplier });
            ageFired = true;
        }
    }
    // 4d. Multi-vehicle: fleet total * bulk discount
    if (extra_vehicle_count > 0) {
        const mvRule = regularRules.find((r) => r.context === 'multi_vehicle');
        if (mvRule) {
            const combined = price * (extra_vehicle_count + 1);
            price = Math.round(combined * mvRule.multiplier * 100) / 100;
            applied.push({ label: mvRule.label, multiplier: mvRule.multiplier });
        }
        else {
            price = price * (extra_vehicle_count + 1);
        }
    }
    // 4e. Term discount — last
    for (const rule of termDiscounts) {
        if (rule.match_value === term) {
            price = Math.round(price * rule.multiplier * 100) / 100;
            applied.push({ label: rule.label, multiplier: rule.multiplier });
        }
    }
    const response = {
        base_price: basePrice,
        final_price: price,
        applied_rules: applied,
        term_label: termLabels[term] ?? term,
        package_name: pkg.name,
    };
    res.json(response);
});
export default router;
