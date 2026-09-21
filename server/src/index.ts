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
import chatRouter    from './routes/chat.js';
import { startIMAPListener } from './services/imapService.js';
import { startTelegramListener } from './services/telegramListener.js';

const app = express();

// ─── Middleware ───────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '20mb' }));

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
app.use('/api',       chatRouter);    // POST /api/chat

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

// ─── Boot: listen first, then connect MongoDB ─────────────────────
const PORT = Number(process.env.PORT) || 3001;

async function start() {
  // Start HTTP server immediately so notify/payment works even if DB is slow
  await new Promise<void>((resolve) => {
    app.listen(PORT, () => {
      console.log(`\n🚀 PolarGuard API → http://localhost:${PORT}`);
      console.log(`   Health:  GET  /api/health`);
      console.log(`   Public:  GET  /api/packages`);
      console.log(`   Public:  POST /api/quote/calculate`);
      console.log(`   Admin:   POST /api/auth/login\n`);
      resolve();
    });
  });

  // Connect MongoDB after HTTP is up — retry on failure
  const connectWithRetry = async (attempt = 1): Promise<void> => {
    try {
      await connectDB();
      await createIndexes();
      startIMAPListener();
      startTelegramListener();
    } catch (err) {
      console.error(`[mongodb] connection attempt ${attempt} failed:`, (err as Error).message);
      const delay = Math.min(attempt * 5000, 30000);
      console.log(`[mongodb] retrying in ${delay / 1000}s…`);
      setTimeout(() => connectWithRetry(attempt + 1), delay);
    }
  };

  connectWithRetry();
}

if (!process.env.VERCEL) {
  start().catch((err) => {
    console.error('Failed to start:', err);
    process.exit(1);
  });
}

export default app;
