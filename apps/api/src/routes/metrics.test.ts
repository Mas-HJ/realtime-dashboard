import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import metricsRouter from './metrics.js';

// Mock the redis module
vi.mock('../redis.js', () => ({
  getCurrentMetrics: vi.fn(),
  getMetricsHistory: vi.fn(),
}));

import { getCurrentMetrics, getMetricsHistory } from '../redis.js';

function createApp() {
  const app = express();
  app.use('/api/metrics', metricsRouter);
  return app;
}

describe('GET /api/metrics/current', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with metrics data', async () => {
    const mockMetrics = { cpu: 42, memory: 60, timestamp: Date.now() };
    (getCurrentMetrics as ReturnType<typeof vi.fn>).mockResolvedValue(mockMetrics);

    const res = await request(createApp()).get('/api/metrics/current');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockMetrics);
  });

  it('returns 404 when no metrics available', async () => {
    (getCurrentMetrics as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const res = await request(createApp()).get('/api/metrics/current');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'No metrics available' });
  });

  it('returns 500 on error', async () => {
    (getCurrentMetrics as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Redis down'));

    const res = await request(createApp()).get('/api/metrics/current');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to fetch metrics' });
  });
});

describe('GET /api/metrics/history', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with history array', async () => {
    const mockHistory = [
      { cpu: 40, timestamp: 1 },
      { cpu: 45, timestamp: 2 },
    ];
    (getMetricsHistory as ReturnType<typeof vi.fn>).mockResolvedValue(mockHistory);

    const res = await request(createApp()).get('/api/metrics/history');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockHistory);
  });

  it('returns 500 on error', async () => {
    (getMetricsHistory as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Redis down'));

    const res = await request(createApp()).get('/api/metrics/history');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to fetch history' });
  });
});
