import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../server/src/index.js';
import { connectDB } from '../server/src/db/client.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connectDB();
  } catch (err) {
    console.error('[vercel serverless db connection error]', err);
  }
  return app(req, res);
}
