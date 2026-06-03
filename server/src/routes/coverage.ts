import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { getDB } from '../db/client.js';
import { requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import type { CoverageRowDoc, CoverageRowResponse } from '../types/index.js';

const router = Router();

// ─── Helper ───────────────────────────────────────────────────────

function toResponse(doc: CoverageRowDoc): CoverageRowResponse {
  return {
    id:          doc._id!.toString(),
    sort_order:  doc.sort_order,
    name:        doc.name,
    description: doc.description,
    basic_value: doc.basic_value,
    full_value:  doc.full_value,
    is_active:   doc.is_active,
  };
}

// ─── Validation Schemas ───────────────────────────────────────────

const createRowSchema = z.object({
  sort_order:  z.number().int().min(0).default(0),
  name:        z.string().min(1).max(200),
  description: z.string().max(500).default(''),
  basic_value: z.string().min(1),
  full_value:  z.string().min(1),
  is_active:   z.boolean().default(true),
});

const updateRowSchema = createRowSchema.partial();

// ─── Routes ───────────────────────────────────────────────────────

/**
 * GET /api/admin/coverage-rows
 */
router.get('/coverage-rows', requireAdmin, async (_req, res) => {
  const db = getDB();
  const rows = await db
    .collection<CoverageRowDoc>('coverage_rows')
    .find()
    .sort({ sort_order: 1 })
    .toArray();
  res.json(rows.map(toResponse));
});

/**
 * POST /api/admin/coverage-rows
 */
router.post('/coverage-rows', requireAdmin, validate(createRowSchema), async (req, res) => {
  const db = getDB();
  const body = req.body as z.infer<typeof createRowSchema>;

  const now = new Date();
  const doc: CoverageRowDoc = { ...body, created_at: now, updated_at: now };

  const result = await db.collection<CoverageRowDoc>('coverage_rows').insertOne(doc);
  doc._id = result.insertedId;
  res.status(201).json(toResponse(doc));
});

/**
 * PUT /api/admin/coverage-rows/:id
 */
router.put('/coverage-rows/:id', requireAdmin, validate(updateRowSchema), async (req, res) => {
  const db = getDB();
  const id   = new ObjectId(String(req.params.id));
  const body = req.body as z.infer<typeof updateRowSchema>;

  const $set: Record<string, unknown> = { updated_at: new Date() };
  if (body.sort_order  !== undefined) $set['sort_order']  = body.sort_order;
  if (body.name        !== undefined) $set['name']        = body.name;
  if (body.description !== undefined) $set['description'] = body.description;
  if (body.basic_value !== undefined) $set['basic_value'] = body.basic_value;
  if (body.full_value  !== undefined) $set['full_value']  = body.full_value;
  if (body.is_active   !== undefined) $set['is_active']   = body.is_active;

  if (Object.keys($set).length === 1) { res.status(400).json({ error: 'No fields to update' }); return; }

  const result = await db
    .collection<CoverageRowDoc>('coverage_rows')
    .findOneAndUpdate({ _id: id }, { $set }, { returnDocument: 'after' });

  if (!result) { res.status(404).json({ error: 'Coverage row not found' }); return; }
  res.json(toResponse(result));
});

/**
 * DELETE /api/admin/coverage-rows/:id  — soft delete
 */
router.delete('/coverage-rows/:id', requireAdmin, async (req, res) => {
  const db = getDB();
  const id = new ObjectId(String(req.params.id));

  const result = await db
    .collection<CoverageRowDoc>('coverage_rows')
    .findOneAndUpdate({ _id: id }, { $set: { is_active: false, updated_at: new Date() } });

  if (!result) { res.status(404).json({ error: 'Coverage row not found' }); return; }
  res.json({ message: 'Coverage row deactivated', id: id.toString() });
});

export default router;
