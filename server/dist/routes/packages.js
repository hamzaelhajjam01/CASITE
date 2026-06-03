import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { getDB } from '../db/client.js';
import { requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
const router = Router();
// ─── Helper ───────────────────────────────────────────────────────
function toPackageResponse(doc, coverageRows) {
    const response = {
        id: doc._id.toString(),
        slug: doc.slug,
        name: doc.name,
        description: doc.description,
        is_active: doc.is_active,
        prices: doc.prices,
    };
    if (coverageRows) {
        response.coverage_rows = coverageRows.map((r) => ({
            id: r._id.toString(),
            sort_order: r.sort_order,
            name: r.name,
            description: r.description,
            basic_value: r.basic_value,
            full_value: r.full_value,
            is_active: r.is_active,
        }));
    }
    return response;
}
// ─── Validation Schemas ───────────────────────────────────────────
const pricesSchema = z.object({
    '1m': z.number().positive(),
    '3m': z.number().positive(),
    '6m': z.number().positive(),
    '12m': z.number().positive(),
});
const createPackageSchema = z.object({
    slug: z.string().regex(/^[a-z0-9_-]+$/, 'Slug must be lowercase alphanumeric'),
    name: z.string().min(1).max(100),
    description: z.string().max(500).default(''),
    prices: pricesSchema,
});
const updatePackageSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    is_active: z.boolean().optional(),
    prices: pricesSchema.partial().optional(),
});
// ─── Public Routes ────────────────────────────────────────────────
/**
 * GET /api/packages
 * All active packages with prices + embedded coverage rows.
 */
router.get('/packages', async (_req, res) => {
    const db = getDB();
    const packages = await db
        .collection('packages')
        .find({ is_active: true })
        .sort({ _id: 1 })
        .toArray();
    const coverageRows = await db
        .collection('coverage_rows')
        .find({ is_active: true })
        .sort({ sort_order: 1 })
        .toArray();
    const result = packages.map((pkg) => toPackageResponse(pkg, coverageRows));
    res.json(result);
});
// ─── Admin Routes ─────────────────────────────────────────────────
/**
 * GET /api/admin/packages
 */
router.get('/admin/packages', requireAdmin, async (_req, res) => {
    const db = getDB();
    const packages = await db
        .collection('packages')
        .find()
        .sort({ _id: 1 })
        .toArray();
    res.json(packages.map((p) => toPackageResponse(p)));
});
/**
 * POST /api/admin/packages
 */
router.post('/admin/packages', requireAdmin, validate(createPackageSchema), async (req, res) => {
    const db = getDB();
    const body = req.body;
    const now = new Date();
    const doc = {
        slug: body.slug,
        name: body.name,
        description: body.description,
        is_active: true,
        prices: body.prices,
        created_at: now,
        updated_at: now,
    };
    const result = await db.collection('packages').insertOne(doc);
    doc._id = result.insertedId;
    res.status(201).json(toPackageResponse(doc));
});
/**
 * PUT /api/admin/packages/:id
 */
router.put('/admin/packages/:id', requireAdmin, validate(updatePackageSchema), async (req, res) => {
    const db = getDB();
    const id = new ObjectId(String(req.params.id));
    const body = req.body;
    const $set = { updated_at: new Date() };
    if (body.name !== undefined)
        $set['name'] = body.name;
    if (body.description !== undefined)
        $set['description'] = body.description;
    if (body.is_active !== undefined)
        $set['is_active'] = body.is_active;
    if (body.prices) {
        for (const [term, price] of Object.entries(body.prices)) {
            if (price !== undefined)
                $set[`prices.${term}`] = price;
        }
    }
    const result = await db
        .collection('packages')
        .findOneAndUpdate({ _id: id }, { $set }, { returnDocument: 'after' });
    if (!result) {
        res.status(404).json({ error: 'Package not found' });
        return;
    }
    res.json(toPackageResponse(result));
});
/**
 * DELETE /api/admin/packages/:id  — soft delete
 */
router.delete('/admin/packages/:id', requireAdmin, async (req, res) => {
    const db = getDB();
    const id = new ObjectId(String(req.params.id));
    const result = await db
        .collection('packages')
        .findOneAndUpdate({ _id: id }, { $set: { is_active: false, updated_at: new Date() } });
    if (!result) {
        res.status(404).json({ error: 'Package not found' });
        return;
    }
    res.json({ message: 'Package deactivated', id: id.toString() });
});
export default router;
