import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';

// Load environment variables from .env
dotenv.config();

// ─── Sentry Initialization ──────────────────────────────
Sentry.init({
  dsn: process.env.SENTRY_DSN || "",
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Global Middleware ──────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use(express.json());

// ─── Rate Limiting ──────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per `window`
  message: { success: false, message: "Too many requests, please try again later." }
});
app.use('/api', apiLimiter);

// ─── Static Files (uploaded images) ─────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ─── API Routes ─────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('<h1>PMS Backend API is running!</h1><p>Please use the Web Admin on <a href="http://localhost:5173">http://localhost:5173</a> to view the web app.</p>');
});
app.use('/api', routes);

// ─── Sentry Error Handler ───────────────────────────────
Sentry.setupExpressErrorHandler(app);

// ─── Global Error Handler (Constitution: "Do No Harm") ──
app.use(errorHandler);

// ─── Start Server ───────────────────────────────────────
app.listen(PORT, () => {
    console.log(`✅ SOH System API running on http://localhost:${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

export default app;

