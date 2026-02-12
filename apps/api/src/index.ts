import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { setupSocket } from './socket.js';
import { startGenerator } from './generator.js';
import metricsRouter from './routes/metrics.js';

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 3001;
const CORS_ORIGINS = process.env.CORS_ORIGIN?.split(',') || [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
];

// Middleware
app.use(cors({ origin: CORS_ORIGINS }));
app.use(express.json());

// Routes
app.use('/api/metrics', metricsRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Setup Socket.io
setupSocket(httpServer);

// Start the server
httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   Real-time Metrics API Server         ║
╠════════════════════════════════════════╣
║   Port: ${String(PORT).padEnd(29)}║
║   CORS: ${CORS_ORIGINS[0].padEnd(29)}║
╚════════════════════════════════════════╝
  `);

  // Start generating mock metrics
  startGenerator();
});
