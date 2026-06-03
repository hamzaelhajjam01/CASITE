import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { getDB } from '../db/client.js';
import { requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
const router = Router();
// ─── Helper ───────────────────────────────────────────────────────
function toResponse(doc) {
    return {
        id: doc._id.toString(),
        rule_key: doc.rule_key,
        label: doc.label,
        rule_type: doc.rule_type,
        context: doc.context,
        match_value: doc.match_value,
        multiplier: doc.multiplier,
        is_active: doc.is_active,
    };
}
// ─── Validation Schemas ───────────────────────────────────────────
const createRuleSchema = z.object({
    rule_key: z.string().regex(/^[a-z0-9_]+$/, 'rule_key must be lowercase alphanumeric + underscores'),
    label: z.string().min(1).max(200),
    rule_type: z.enum(['multiplier', 'term_discount']),
    context: z.enum(['deductible', 'license', 'age', 'multi_vehicle', 'term']),
    match_value: z.string().nullable().default(null),
    multiplier: z.number().positive().max(10),
    is_active: z.boolean().default(true),
});
const updateRuleSchema = createRuleSchema.omit({ rule_key: true }).partial();
// ─── Routes ───────────────────────────────────────────────────────
/**
 * GET /api/admin/pricing-rules
 */
router.get('/pricing-rules', requireAdmin, async (_req, res) => {
    const db = getDB();
    const rules = await db
        .collection('pricing_rules')
        .find()
        .sort({ context: 1, rule_key: 1 })
        .toArray();
    res.json(rules.map(toResponse));
});
/**
 * POST /api/admin/pricing-rules
 */
router.post('/pricing-rules', requireAdmin, validate(createRuleSchema), async (req, res) => {
    const db = getDB();
    const body = req.body;
    const now = new Date();
    const doc = { ...body, created_at: now, updated_at: now };
    const result = await db.collection('pricing_rules').insertOne(doc);
    doc._id = result.insertedId;
    res.status(201).json(toResponse(doc));
});
/**
 * PUT /api/admin/pricing-rules/:id
 */
router.put('/pricing-rules/:id', requireAdmin, validate(updateRuleSchema), async (req, res) => {
    const db = getDB();
    const id = new ObjectId(String(req.params.id));
    const body = req.body;
    const $set = { updated_at: new Date() };
    if (body.label !== undefined)
        $set['label'] = body.label;
    if (body.rule_type !== undefined)
        $set['rule_type'] = body.rule_type;
    if (body.context !== undefined)
        $set['context'] = body.context;
    if (body.match_value !== undefined)
        $set['match_value'] = body.match_value;
    if (body.multiplier !== undefined)
        $set['multiplier'] = body.multiplier;
    if (body.is_active !== undefined)
        $set['is_active'] = body.is_active;
    if (Object.keys($set).length === 1) {
        res.status(400).json({ error: 'No fields to update' });
        return;
    }
    const result = await db
        .collection('pricing_rules')
        .findOneAndUpdate({ _id: id }, { $set }, { returnDocument: 'after' });
    if (!result) {
        res.status(404).json({ error: 'Pricing rule not found' });
        return;
    }
    res.json(toResponse(result));
});
/**
 * DELETE /api/admin/pricing-rules/:id  — hard delete
 */
router.delete('/pricing-rules/:id', requireAdmin, async (req, res) => {
    const db = getDB();
    const id = new ObjectId(String(req.params.id));
    const result = await db.collection('pricing_rules').findOneAndDelete({ _id: id });
    if (!result) {
        res.status(404).json({ error: 'Pricing rule not found' });
        return;
    }
    res.json({ message: 'Pricing rule deleted', id: id.toString() });
});
export default router;
