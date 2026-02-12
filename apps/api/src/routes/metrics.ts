import { Router, Request, Response } from 'express';
import { getCurrentMetrics, getMetricsHistory } from '../redis.js';

const router = Router();

router.get('/current', async (_req: Request, res: Response) => {
  try {
    const metrics = await getCurrentMetrics();
    if (!metrics) {
      res.status(404).json({ error: 'No metrics available' });
      return;
    }
    res.json(metrics);
  } catch (err) {
    console.error('Error fetching current metrics:', err);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

router.get('/history', async (_req: Request, res: Response) => {
  try {
    const history = await getMetricsHistory();
    res.json(history);
  } catch (err) {
    console.error('Error fetching metrics history:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export default router;
