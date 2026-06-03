import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db/client.js';
import { createIndexes } from './db/schema.js';
import authRouter     from './routes/auth.js';
import packagesRouter from './routes/packages.js';
import pricingRouter  from './routes/pricing.js';
import coverageRouter from './routes/coverage.js';
import quoteRouter    from './routes/quote.js';
import settingsRouter from './routes/settings.js';
import notifyRouter  from './routes/notify.js';

const app = express();

// ─── Middleware ───────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// ─── Health check ─────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────────
app.use('/api/auth',  authRouter);      // POST /api/auth/login
app.use('/api',       packagesRouter);  // GET  /api/packages  +  admin CRUD
app.use('/api/admin', pricingRouter);   // /api/admin/pricing-rules
app.use('/api/admin', coverageRouter);  // /api/admin/coverage-rows
app.use('/api',       quoteRouter);     // POST /api/quote/calculate
app.use('/api',       settingsRouter);  // GET  /api/settings
app.use('/api/admin', settingsRouter);  // PUT  /api/admin/settings
app.use('/api/notify', notifyRouter);  // POST /api/notify/payment

// ─── Global error handler ─────────────────────────────────────────
app.use((
  err: Error,
  _req: express.Request,
  res: express.Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: express.NextFunction
) => {
  console.error('[error]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Boot: connect MongoDB → create indexes → listen ─────────────
const PORT = Number(process.env.PORT) || 3001;

async function start() {
  await connectDB();
  await createIndexes();

  app.listen(PORT, () => {
    console.log(`\n🚀 PolarGuard API → http://localhost:${PORT}`);
    console.log(`   Health:  GET  /api/health`);
    console.log(`   Public:  GET  /api/packages`);
    console.log(`   Public:  POST /api/quote/calculate`);
    console.log(`   Admin:   POST /api/auth/login\n`);
  });
}

start().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
